const express = require ("express");
const app = express();
const path = require("path");
const fs = require('fs');  
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://savio0dev:Sa07ca16@@savi0dev.qmvjqus.mongodb.net/?retryWrites=true&w=majority&appName=savi0dev";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


const diretorio_de_entrada = '/app/shared-data';
const dados_aninhado = 'dados_aninhado_live.json';
const dados_brutos = 'dados.json';


const entrada = path.join(diretorio_de_entrada, dados_aninhado);


app.get("/",(req , res)=>{

    fs.readFile(entrada, 'utf8', (err, dados) => {
        if (err) {
            return res.status(500).send('Erro ao ler os dados');
        }
        
        // Envia o conteúdo do arquivo JSON para o cliente
        res.json(JSON.parse(dados));
    });
});
app.get("/live",(req , res)=>{
    fs.readFile(entrada, 'utf8', (err, dados) => {
        if (err) {
            return res.status(500).send('Erro ao ler os dados');
        }
        
        // Envia o conteúdo do arquivo JSON para o cliente
        res.json(JSON.parse(dados));
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



const porta = 8081;
app.listen(porta , ()=>{
    console.log(`server in open ${porta}`)
});