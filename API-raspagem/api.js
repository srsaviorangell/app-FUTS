const express = require('express');
const fs = require('fs');
const app = express();
const puppeteer = require('puppeteer');

const url = "https://www.sofascore.com/";

const seletores = {
    // delimitador: '.HorizontalDivider.gqlAIl',
    paisOuLiga: '.Box.Flex.dOBJED.hURKmT > a > .Text.eOobrs',
    imgPais: '.Box.Flex.cBIkhT.jLRkRA img.Img.ccYJkt, .Box.Flex.cBIkhT.jLRkRA img.Img.kMzyHA, .Box.Flex.cBIkhT.jLRkRA img.Img.ccYJkt '
    // tempo: '[data-testid="event_time"], .Text.kcRyBI',
    // horario: '[data-testid="event_status"], .Box.Flex.jTiCHC.cRYpNI.sc-efac74ba-2.gxmYGv.score-box',
    // nomeH1: '[data-testid="left_team"], .Text.ezSveL',
    // escudoH1: '[data-testid="left_team"] .Img.jbaYme',
    // nomeH2: '[data-testid="right_team"], .Text.ezSveL',
    // escudoH2: '[data-testid="right_team"] .Img.jbaYme',
    // placarH1: '[data-testid="left_score"], .Text.cvwZXc.currentScore',
    // placarH2: '[data-testid="right_score"], .Text.cvwZXc.currentScore'
};

async function apiRasp(url) {
    const browser = await puppeteer.launch({ headless: false }); // headless: true para não abrir uma janela do navegador
    const page = await browser.newPage();
    await page.goto(url, { timeout: 35000 });
    

    // Clique ao vivo 
    const aoVivo = '.sc-52cfa3b2-0.gQokGz';
    
    
    await page.evaluate((selector) => {
        const button = document.querySelector(selector);
        if (button) {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }
    }, aoVivo);
    console.log('click ok')

    // Aguarde o carregamento dos campeonatos
    await page.waitForSelector(seletores.paisOuLiga , { timeout: 10000 });
    console.log('Seletor  encontrado');

    const mostra =  await page.evaluate((seletores) =>{ 
        const dados =[] ;// aqui onde vai entra o dado se tem 
        const elem =  document.querySelectorAll(seletores.paisOuLiga);
        
        elem.forEach(el =>{
            const imgElems = el.closest('.Box.Flex.cBIkhT.jLRkRA').querySelectorAll(seletores.imgPais); // aqui a função closest ele apenas vai acossiar o dado ao classe pai que e para garantir que seja o mesmo  e logo em seguida passamos o seletor que dejamos
            const imgPaiz = Array.from(imgElems).map(img => { // aqui transforma em array e depois quebra em map 
                let src = img.getAttribute('src'); // aqui pasamos para um constante que muda e ficar variavel para o if poder rodar 
                if(src.startsWith('/static/images/flags/')) { // esse if ele verificar se existem os src com esse endereço
                    src = 'https://www.sofascore.com'+ src; // se ouver ele vai concatenara esse link para ter um caminho valido a png
                }
                return src; // aqui ele retorna
            });

            dados.push({
                campenalto: el.textContent.trim(),
                img: imgPaiz
                
            });

        })
        return dados;

    },seletores);

    console.log(mostra);

    fs.writeFileSync('dados.json',JSON.stringify(mostra,null,2),'utf8');
    await browser.close();
}

// Chamada da função
apiRasp(url);