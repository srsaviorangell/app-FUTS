const express = require('express');
const fs = require('fs');
const app = express();
const puppeteer = require('puppeteer');

const url = "https://www.sofascore.com/";

const seletores = {
    delimitador: '.HorizontalDivider.gqlAIl',
    conteCampeonato: '.Box.klGMtt',
    paisOuLiga: '.Box.Flex.dOBJED.hURKmT > a > .Text.eOobrs',
    imgPais: '.Img.ccYJkt',
    conteTemHo: '.Box.Flex.cBIkhT.cQgcrM.sc-929a8fc9-0.dvkfVt',
    tempo: '[data-testid="event_time"], .Text.kcRyBI',
    horario: '[data-testid="event_status"], .Box.Flex.jTiCHC.cRYpNI.sc-efac74ba-2.gxmYGv.score-box',
    conteInfoTimes: '.Box.dtLxRI',
    nomeH1: '[data-testid="left_team"], .Text.ezSveL',
    escudoH1: '[data-testid="left_team"] .Img.jbaYme',
    nomeH2: '[data-testid="right_team"], .Text.ezSveL',
    escudoH2: '[data-testid="right_team"] .Img.jbaYme',
    contePlacar: '.Box.Flex.gulcjH.yaNbA',
    placarH1: '[data-testid="left_score"], .Text.cvwZXc.currentScore',
    placarH2: '[data-testid="right_score"], .Text.cvwZXc.currentScore'
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
            dados.push({
                campenalto: el.textContent.trim()
            });

        })
        return dados;

    },seletores);

    console.log(mostra);
    await browser.close();
    
}

// Chamada da função
apiRasp(url);