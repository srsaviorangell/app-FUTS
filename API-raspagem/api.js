const express = require('express');
const fs = require('fs');
const app = express();
const puppeteer = require('puppeteer');

const url = "https://www.sofascore.com/";

const seletores = {
    delimitador: '.HorizontalDivider.gqlAIl',
    conteCampeonato: '.Box.klGMtt',
    paisOuLiga: '.Box.Flex.eHnLBZ a:nth-child(1) bdi',
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
    const browser = await puppeteer.launch({ headless: true }); // headless: true para não abrir uma janela do navegador
    const page = await browser.newPage();
    await page.goto(url, { timeout: 35000 });

    // Clique para expandir eventos ao vivo (se necessário)
    const selectorExpand = '.dmnHLc';
    console.log('Tentando encontrar e clicar no seletor de eventos ao vivo...');
    await page.evaluate((selector) => {
        const button = document.querySelector(selector);
        if (button) {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }
    }, selectorExpand);

    // Aguarde o carregamento dos campeonatos
    await page.waitForSelector(seletores.conteCampeonato, { timeout: 10000 });
    console.log('Seletor de campeonatos encontrado');

    const campeonatos = await page.evaluate((seletores) => {
        const campeonatosData = [];
        const campeonatosElems = document.querySelectorAll(seletores.conteCampeonato);

        campeonatosElems.forEach(campeonatoElem => {
            const nomeCampeonato = campeonatoElem.querySelector(seletores.paisOuLiga)?.textContent.trim();
            const imgElem = campeonatoElem.querySelector(seletores.imgPais);
            const imgPais = imgElem ? imgElem.getAttribute('src') : 'N/A';
            const imgAlt = imgElem ? imgElem.getAttribute('alt') : 'N/A';

            const jogos = [];
            const jogosElems = campeonatoElem.querySelectorAll(seletores.conteTemHo);
            
            jogosElems.forEach(jogoElem => {
                const horario = jogoElem.querySelector(seletores.horario)?.textContent.trim();
                const tempo = jogoElem.querySelector(seletores.tempo)?.textContent.trim();
                
                const timesElem = jogoElem.querySelector(seletores.conteInfoTimes);
                const nomeH1 = timesElem.querySelector(seletores.nomeH1)?.textContent.trim();
                const escudoH1 = timesElem.querySelector(seletores.escudoH1)?.getAttribute('src');
                const nomeH2 = timesElem.querySelector(seletores.nomeH2)?.textContent.trim();
                const escudoH2 = timesElem.querySelector(seletores.escudoH2)?.getAttribute('src');
                
                const placarElem = jogoElem.querySelector(seletores.contePlacar);
                const placarH1 = placarElem.querySelector(seletores.placarH1)?.textContent.trim();
                const placarH2 = placarElem.querySelector(seletores.placarH2)?.textContent.trim();

                jogos.push({
                    horario: horario || 'N/A',
                    tempo: tempo || 'N/A',
                    time1: {
                        nome: nomeH1 || 'N/A',
                        escudo: escudoH1 || 'N/A'
                    },
                    time2: {
                        nome: nomeH2 || 'N/A',
                        escudo: escudoH2 || 'N/A'
                    },
                    placar: {
                        time1: placarH1 || 'N/A',
                        time2: placarH2 || 'N/A'
                    }
                });
            });

            campeonatosData.push({
                nome: nomeCampeonato || 'N/A',
                imgPais: imgPais,
                imgAlt: imgAlt,
                jogos: jogos
            });
        });

        return campeonatosData;
    }, seletores);

    console.log('Estrutura de campeonatos e jogos:', campeonatos);

    await browser.close();
    return campeonatos;
}

// Chamada da função
apiRasp(url).then(result => {
    fs.writeFileSync('campeonatos.json', JSON.stringify(result, null, 2));
    console.log('Dados salvos em campeonatos.json');
}).catch(error => {
    console.error('Erro na raspagem:', error);
});
