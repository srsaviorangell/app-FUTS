const express = require('express');
const fs = require('fs');
const app = express();
const puppeteer = require('puppeteer');

const url = "https://www.sofascore.com/";

const seletores = {
    contgeral:'.Box.klGMtt ',
    separdor:'.HorizontalDivider.gqlAIl',
    ContCampenalto:'.Box.klGMtt >.Box.Flex.cBIkhT.jLRkRA',
    nomePais: 'Box.Flex.eHnLBZ.kkrevz > a > .Text.cbiYVh',
    contPaisOuLiga:'.Box.klGMtt >.Box.Flex.cBIkhT.jLRkRA > .Box.Flex.dOBJED.hURKmT',
    paisOuLiga: '.Box.Flex.cBIkhT.jLRkRA > .Box.Flex.dOBJED.hURKmT a .Text.eOobrs',
    imgPais: '.Box.Flex.cBIkhT.jLRkRA img.Img.ccYJkt, .Box.Flex.cBIkhT.jLRkRA img.Img.kMzyHA, .Box.Flex.cBIkhT.jLRkRA img.Img.ccYJkt ',

    contHorarioTempo:'.Box.jKVshf',
    horario: '.Text.kcRyBI',
    tempo: '.Box.Flex.jTiCHC.cRYpNI.sc-efac74ba-2.gxmYGv.score-box .Text.fjeMtb.currentScore bdi',

    ContJogos:'.Box.dtLxRI',
    nomeH1: '[data-testid="left_team"] .Text.ezSveL',
    escudoH1: '[data-testid="left_team"] .Img.jbaYme',
    nomeH2: '[data-testid="right_team"] .Text.ezSveL',
    escudoH2: '[data-testid="right_team"] .Img.jbaYme',

    contPlacar: '.Box.Flex.gulcjH.yaNbA',
    placarH1: '[data-testid="left_score"] .Text.cvwZXc.currentScore',
    placarH2: '[data-testid="right_score"] .Text.cvwZXc.currentScore'
};

async function apiRasp(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { timeout: 45000 });

    // Clique ao vivo 
    const aoVivo = '.sc-52cfa3b2-0.gQokGz';
    
    await page.evaluate((selector) => {
        const button = document.querySelector(selector);
        if (button) {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }
    }, aoVivo);
    console.log('click ok')

     //Aguarde o carregamento dos campeonatos
    await page.waitForSelector(seletores.ContJogos, { timeout:30000 });
    console.log('Seletor encontrado , cont pais');
    await page.waitForSelector(seletores.contHorarioTempo, { timeout: 10000 });
    console.log('Seletor encontrado , horario');

    await page.waitForSelector(seletores.contPlacar, { timeout: 10000 });
    console.log('Seletor encontrado , placar');

    await page.waitForSelector(seletores.paisOuLiga , { timeout: 10000 });
    console.log('Seletor encontrado , campenalto ');
    await page.waitForSelector(seletores.separdor,{timeout: 20000})


    //   // Função para rolar a página para carregar todo o conteúdo
    //   const scrollToBottom = async () => {
    //       await page.evaluate(async () => {
    //           await new Promise((resolve) => {
    //              let totalHeight = 0;
    //               const distance = 550;
    //               const timer = setInterval(() => {
    //                   const scrollHeight = document.body.scrollHeight;
    //                   window.scrollBy(0, distance);
    //                   totalHeight += distance;

    //                   if (totalHeight >= scrollHeight) {
    //                       clearInterval(timer);
    //                       resolve();
    //                  }
    //               }, 1000);
    //           });
    //       });
    //  };

    //   await scrollToBottom(); // Rolagem para carregar todos os jogos
    //  console.log('rolagem finalizada');

    const mostra = await page.evaluate(async (seletores) => {
        const ligas = [];
        const ligasElems = document.querySelectorAll(seletores.paisOuLiga);
        
        for (const liga of ligasElems) {
            const campeonatos = []; // Correção aqui

            const campenaltosElems = liga.closest('.Box.Flex.cBIkhT.jLRkRA').querySelectorAll('.Box.Flex.dOBJED.hURKmT');
            for (const campenalto of campenaltosElems) {
                const nomeLiga = campenalto.querySelector(seletores.paisOuLiga)?.textContent.trim(); // Corrigido
                const imgP = [...liga.closest('.Box.Flex.cBIkhT.jLRkRA').querySelectorAll(seletores.imgPais)].map(img => {
                    let src = img.getAttribute('src');
                    if (src.startsWith('/static/images/flags/')) {
                        src = 'https://www.sofascore.com' + src;
                    }
                    return src;
                });

                campeonatos.push({ // Adiciona ao array campeonatos
                    nome: nomeLiga,
                    imgP: imgP
                });
            }

            //Verifica se o separador é o esperado
             if (separador ) {
                 break; // Se o separador estiver presente, sai do loop para começar o próximo campeonato
             }
             const horaTempo = [...document.querySelectorAll(seletores.contHorarioTempo)].map(ht => {
                 const horarioElem = ht.querySelector(seletores.horario);
                 const tempoElem = ht.querySelector(seletores.tempo);
                 return {
                     hora_tempo: {
                         horario: horarioElem ? horarioElem.textContent.trim() : "vazio",
                         tempo: tempoElem ? tempoElem.textContent.trim() : "vazio"
                     }
                 };
            });

            const jogos = [...document.querySelectorAll(seletores.ContJogos)].map(jog => {
                const nomeH1Elem = jog.querySelector(seletores.nomeH1);
                const nomeH2Elem = jog.querySelector(seletores.nomeH2);
                const escudoH1Elem = jog.querySelector(seletores.escudoH1);
                 const escudoH2Elem = jog.querySelector(seletores.escudoH2);

                 return {
                     times: {
                         escudoH1: escudoH1Elem ? escudoH1Elem.getAttribute('src') : "vazio",
                        nomeH1: nomeH1Elem ? nomeH1Elem.textContent.trim() : "vazio",
                        x: "=",
                         escudoH2: escudoH2Elem ? escudoH2Elem.getAttribute('src') : "vazio",
                         nomeH2: nomeH2Elem ? nomeH2Elem.textContent.trim() : "vazio"
                     }
                 };
             });

             const placarJogos = [...document.querySelectorAll(seletores.contPlacar)].map(placa => {
                 const placarH1Elems = placa.querySelector(seletores.placarH1);
                 const placarH2Elems = placa.querySelector(seletores.placarH2);
                 return {
                     placar: {
                         h1: placarH1Elems ? placarH1Elems.textContent.trim() : "vazio",
                         x: 'x',
                         h2: placarH2Elems ? placarH2Elems.textContent.trim() : "vazio"
                     }
                 };
             });

             

            ligas.push({
                campeonatos: campeonatos,
                
                 jogos: jogos.map((jogo, index) => ({
                     ...jogo,
                      horaTempo: horaTempo,
                  placar: placarJogos[index] ? placarJogos[index].placar : {}
                 }))
            });
        }

        return ligas;
    }, seletores);
    console.log(JSON.stringify(mostra, null, 2));

    fs.writeFileSync('dados.json', JSON.stringify(mostra, null, 2), 'utf8');
      browser.close();
}
// Chamada da função 
apiRasp(url);
//aqui funcuina perfeito 