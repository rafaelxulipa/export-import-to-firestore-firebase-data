import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

// 🔐 Lê o arquivo de credenciais
const serviceAccount = JSON.parse(fs.readFileSync("./credentials.json", "utf-8"));

// 🚀 Inicializa o Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function importFirestore() {
  console.log("📥 Iniciando restauração do Firestore...");

  // Lê o arquivo JSON
  const data = JSON.parse(fs.readFileSync("firestore-backup.json", "utf-8"));
  const collectionNames = Object.keys(data);

  for (const colName of collectionNames) {
    console.log(`📁 Restaurando coleção: ${colName}`);
    const documents = data[colName];

    for (const doc of documents) {
      const { id, _subcollections, ...docData } = doc;

      const docRef = db.collection(colName).doc(id);
      await docRef.set(docData);
      console.log(`  ✅ Documento restaurado: ${colName}/${id}`);

      // 🔁 Restaura subcoleções, se houver
      if (_subcollections) {
        for (const [subName, subDocs] of Object.entries(_subcollections)) {
          for (const subDoc of subDocs) {
            const { id: subId, ...subData } = subDoc;
            await docRef.collection(subName).doc(subId).set(subData);
            console.log(`    ↳ Subcoleção restaurada: ${colName}/${id}/${subName}/${subId}`);
          }
        }
      }
    }
  }

  console.log("✅ Restauração concluída com sucesso!");
}

importFirestore().catch((err) => {
  console.error("❌ Erro ao importar Firestore:", err);
});
