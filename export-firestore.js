import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

// 🔐 Lê o arquivo JSON manualmente
const serviceAccount = JSON.parse(fs.readFileSync("./credentials.json", "utf-8"));

// 🚀 Inicializa o Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function exportFirestore() {
  console.log("📦 Iniciando exportação do Firestore...");
  const allCollections = await db.listCollections();
  const data = {};

  for (const collection of allCollections) {
    console.log(`📁 Exportando coleção: ${collection.id}`);
    const snapshot = await collection.get();
    data[collection.id] = [];

    for (const doc of snapshot.docs) {
      const docData = doc.data();

      // 🔍 Subcoleções
      const subCollections = await doc.ref.listCollections();
      if (subCollections.length > 0) {
        docData._subcollections = {};
        for (const subCol of subCollections) {
          const subSnap = await subCol.get();
          docData._subcollections[subCol.id] = subSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
        }
      }

      data[collection.id].push({
        id: doc.id,
        ...docData,
      });
    }
  }

  // 💾 Salva o backup
  fs.writeFileSync("firestore-backup.json", JSON.stringify(data, null, 2));
  console.log("✅ Backup salvo em firestore-backup.json");
}

exportFirestore().catch((err) => {
  console.error("❌ Erro ao exportar Firestore:", err);
});
