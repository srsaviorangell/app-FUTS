const express = require ("express");
const app = express();
const path = require("path");
const fs = require('fs');  


app.get("/",(req , res)=>{

    fs.readFile(path.join(__dirname, 'shared-data/dados_aninhado_live.json'), 'utf8', (err, dados) => {
        if (err) {
            return res.status(500).send('Erro ao ler os dados');
        }
        
        // Envia o conteúdo do arquivo JSON para o cliente
        res.json(JSON.parse(dados));
    });
});
app.get("/live",(req , res)=>{
    fs.readFile(path.join(__dirname, '../raspagem_em_py/dados_aninhado_live.json'), 'utf8', (err, dados) => {
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