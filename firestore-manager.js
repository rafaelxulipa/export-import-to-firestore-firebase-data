import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

// 🔐 Lê credenciais
const serviceAccount = JSON.parse(fs.readFileSync("./credentials.json", "utf-8"));

// 🚀 Inicializa Firebase
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Função utilitária para log
const log = (msg) => console.log(msg);

// ==============================
// 🔹 EXPORTAR FIRESTORE
// ==============================
async function exportFirestore(collectionName) {
  const data = {};

  if (collectionName) {
    log(`📦 Exportando coleção: ${collectionName}`);
    const colRef = db.collection(collectionName);
    const snapshot = await colRef.get();

    data[collectionName] = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const docData = doc.data();
        const subCols = await doc.ref.listCollections();

        if (subCols.length > 0) {
          docData._subcollections = {};
          for (const subCol of subCols) {
            const subSnap = await subCol.get();
            docData._subcollections[subCol.id] = subSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));
          }
        }

        return { id: doc.id, ...docData };
      })
    );
  } else {
    log("📦 Exportando todas as coleções...");
    const collections = await db.listCollections();

    for (const col of collections) {
      log(`📁 Exportando coleção: ${col.id}`);
      const snapshot = await col.get();

      data[col.id] = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const docData = doc.data();
          const subCols = await doc.ref.listCollections();

          if (subCols.length > 0) {
            docData._subcollections = {};
            for (const subCol of subCols) {
              const subSnap = await subCol.get();
              docData._subcollections[subCol.id] = subSnap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
              }));
            }
          }

          return { id: doc.id, ...docData };
        })
      );
    }
  }

  const outputFile = collectionName
    ? `backup-${collectionName}.json`
    : "firestore-backup.json";

  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  log(`✅ Backup salvo em: ${outputFile}`);
}

// ==============================
// 🔹 IMPORTAR FIRESTORE
// ==============================
async function importFirestore(collectionName) {
  const fileName = collectionName
    ? `backup-${collectionName}.json`
    : "firestore-backup.json";

  if (!fs.existsSync(fileName)) {
    throw new Error(`❌ Arquivo ${fileName} não encontrado.`);
  }

  const data = JSON.parse(fs.readFileSync(fileName, "utf-8"));
  const collections = collectionName ? [collectionName] : Object.keys(data);

  for (const colName of collections) {
    log(`📁 Restaurando coleção: ${colName}`);
    const docs = data[colName];

    for (const doc of docs) {
      const { id, _subcollections, ...docData } = doc;
      const docRef = db.collection(colName).doc(id);

      await docRef.set(docData);
      log(`  ✅ Documento restaurado: ${colName}/${id}`);

      if (_subcollections) {
        for (const [subName, subDocs] of Object.entries(_subcollections)) {
          for (const subDoc of subDocs) {
            const { id: subId, ...subData } = subDoc;
            await docRef.collection(subName).doc(subId).set(subData);
            log(`    ↳ Subcoleção restaurada: ${colName}/${id}/${subName}/${subId}`);
          }
        }
      }
    }
  }

  log("✅ Importação concluída!");
}

// ==============================
// 🧭 CLI Arguments (corrigido e robusto)
// ==============================
const args = {};
const argv = process.argv.slice(2);

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];

  if (arg.startsWith("--")) {
    // formato --key=value
    if (arg.includes("=")) {
      const [key, value] = arg.replace(/^--/, "").split("=");
      args[key] = value;
    }
    // formato --key value
    else if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
      args[arg.replace(/^--/, "")] = argv[i + 1];
      i++;
    } else {
      args[arg.replace(/^--/, "")] = true;
    }
  }
}

const mode = args.mode;
const collection = args.collection;

if (!mode || !["export", "import"].includes(mode)) {
  console.log(`
❌ Modo inválido. Use:
  node firestore-manager.js --mode export
  node firestore-manager.js --mode export --collection users
  node firestore-manager.js --mode import
  node firestore-manager.js --mode import --collection users
`);
  process.exit(1);
}

if (mode === "export") {
  exportFirestore(collection);
} else if (mode === "import") {
  importFirestore(collection);
}
