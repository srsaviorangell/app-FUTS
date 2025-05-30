const express = require ("express");
const app = express();
const path = require("path");
const fs = require('fs');  
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const usuario = "savio0dev";
const senha = "Sa07ca16@";
const senhaEncoded = encodeURIComponent(senha);


const uri = `mongodb+srv://${usuario}:${senhaEncoded}@savi0dev.qmvjqus.mongodb.net/?retryWrites=true&w=majority&appName=savi0dev`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
let db ;

async function run() {
  try {
    await client.connect();
    db= client.db("raspagem");
    console.log("✅ Conectado ao MongoDB!")
  } catch (error) {
      console.error("❌ erro ao conectar :", error);
      process.exit(1);
  }
}

const porta = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

run().then(() => {

 app.listen(porta, ()=>{
        console.log(`🚀 Server rodando na porta ${porta}`);
    });
});

app.get("/", async (req , res)=>{
    try{
        const dados = await db.collection('live').findOne({_id:"dados_live"});
        res.json(dados.dados)
    } catch(error){
        res.status(500).json({error:"erro ao busca dados"});
    }
});
app.get("/live",(req , res)=>{
     fs.readFile(entrada, 'utf8', (err, dados) => {
        if (err) {
            console.error("Erro ao ler arquivo:", err);
            return res.status(500).json({ error: 'Erro ao ler os dados' });
        }
        try {
            const dadosJSON = JSON.parse(dados);
            res.json(dadosJSON);
        } catch (error) {
            console.error("Erro ao parsear JSON:", error);
            res.status(500).json({ error: 'Erro ao processar dados' });
        }
    });
});
app.get("/todosjogos",(req , res)=>{
    res.send("jogos do dia");
});
app.get("/h2h",(req , res)=>{
    res.send("estticas infomacoes e noticias");
});

app.get("/tips",(req , res)=>{
    res.send("prognostcico");
});
app.get("/perfil",(req , res)=>{
    res.send("seus dados e perfil");
});
app.get("/configuracao",(req , res)=>{
    res.send("configure do seu jeito ");
});



