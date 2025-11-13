# 🔥 Firestore Backup Tool

Um utilitário simples em **Node.js** para exportar **todas as coleções e subcoleções** do seu **Firestore** para um arquivo JSON completo.

---

## 🚀 Funcionalidades

- Exporta **todas as coleções** da raiz do Firestore  
- Inclui **subcoleções aninhadas** automaticamente  
- Gera um único arquivo `firestore-backup.json` legível e fácil de importar  
- Baseado no **Firebase Admin SDK**

---

## 📦 Instalação

1. Clone este repositório ou copie os arquivos para o seu projeto:

   ```bash
   git clone https://github.com/seuusuario/firestore-backup
   cd firestore-backup
   npm install

2. Adicione suas credenciais do Firebase:

   * Vá em **Firebase Console → Configurações do Projeto → Contas de Serviço**
   * Clique em **Gerar nova chave privada**
   * Renomeie o arquivo para `credentials.json`
   * Coloque-o na raiz do projeto (mesmo nível do `export-firestore.js`)

---

## ⚙️ Uso

# Exportar tudo
npm run backup

# Exportar apenas a coleção "users"
npm run backup:collection -- --collection=vendors

node firestore-manager.js --mode export --collection=users

# Importar tudo
npm run restore



# Importar apenas a coleção "products"
node firestore-manager.js --mode import --collection=products

npm run restore:collection -- --collection=vendors

---

## 🗂️ Estrutura esperada

```
firestore-backup/
├── credentials.json
├── export-firestore.js
├── firestore-backup.json  ← arquivo gerado
├── package.json
└── README.md
```

---

## 🧩 Exemplo de saída (`firestore-backup.json`)

```json
{
  "users": [
    {
      "id": "abc123",
      "name": "Otávio Melo",
      "email": "otavio@email.com",
      "_subcollections": {
        "orders": [
          { "id": "order1", "total": 150, "status": "paid" }
        ]
      }
    }
  ],
  "products": [
    { "id": "p1", "name": "Produto A", "price": 99.9 }
  ]
}
```

---

## ⚡ Próximos Passos

Em breve será adicionado um script de **importação reversa (`import-firestore.js`)**, para restaurar esse JSON em outro projeto ou ambiente.

---

## 🧠 Tecnologias usadas

* [Node.js](https://nodejs.org/)
* [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
* [Firestore](https://firebase.google.com/docs/firestore)

---

## 🪪 Licença

MIT © [Otávio Melo](https://github.com/seuusuario)

```

---

💡 Basta copiar esse conteúdo e salvar como `README.md` — ele já está com sintaxe e estrutura perfeitas para o GitHub (com títulos, listas, blocos e links renderizando corretamente).  

Quer que eu agora gere o **script `import-firestore.js`** e atualize o README com a seção de restauração também?
```
