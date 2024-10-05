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
    const browser = await puppeteer.launch({ headless: false });
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


    const scrollHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
    });
      
    const viewportHeight = await page.evaluate(() => {
        return window.innerHeight;
    });
      
    const scrollStep = 500; // ajuste esse valor para controlar a velocidade do scroll
      
    for (let i = 0; i < scrollHeight; i += scrollStep) {
        await page.evaluate((scrollHeight) => {
          window.scrollTo(0, scrollHeight);
        }, i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      
        const dados = await page.evaluate(() => {
        const campeonatos = [];
        let campeonatoAtual = null;
        let indiceCampeonato = 1;
        let indiceJogo = 1;


        // Função para extrair informações do jogo
        const extrairJogo = (elemento) => {
            const times = elemento.querySelectorAll('.Text.ezSveL');
            const placar = elemento.querySelectorAll('.Text.cvwZXc.currentScore');
            const horario = elemento.querySelector('.Box.jKVshf .Text.kcRyBI');
            const tempo = elemento.querySelector('.Box.Flex.jTiCHC.cRYpNI.sc-efac74ba-2.gxmYGv.score-box .Text.fjeMtb.currentScore bdi');
            const escudos = elemento.querySelectorAll('.Img.jbaYme');
            return {
                escudoH1:  escudos[0].src || '',
                timeHome: times[0]?.textContent.trim() || '',
                escudoH2 : escudos[1].src || '',
                timeAway: times[1]?.textContent.trim() || '',
                placarHome: placar[0]?.textContent.trim() || '0',
                placarAway: placar[1]?.textContent.trim() || '0',
                horario: horario?.textContent.trim() || '--/--',
                tempo: tempo?.textContent.trim() || '0',
            };
        };

        
        // Iterar sobre todos os elementos relevantes
        document.querySelectorAll('.Box.klGMtt, .HorizontalDivider.gqlAIl')?.forEach((elemento) => {
            if (elemento.querySelector('.Text.eOobrs')) {
                // Encontrou um novo campeonato
                const nomeCampeonato = elemento.querySelector('.Text.eOobrs')?.textContent.trim();
                const imgP = elemento.querySelector('.Box.Flex.cBIkhT.jLRkRA img.Img.ccYJkt, .Box.Flex.cBIkhT.jLRkRA img.Img.kMzyHA, .Box.Flex.cBIkhT.jLRkRA img.Img.ccYJkt ');
                const imgPSrc = imgP? imgP.src : '' ;
                if (nomeCampeonato) {
                    // Finaliza o campeonato atual e inicia um novo
                    if (campeonatoAtual) {
                        campeonatos.push(campeonatoAtual);
                    }
                    campeonatoAtual = {
                        indice: indiceCampeonato,
                        nome: nomeCampeonato,
                        imgPais: imgPSrc,
                        jogos: []
                      };
                      indiceCampeonato++;
                      indiceJogo=1;
                }
            } else if (elemento.querySelectorAll('.Box.dtLxRI').length > 0) {
                // Encontrou jogos
                const jogos = Array.from(elemento.querySelectorAll('.Box.dtLxRI')).map((jogo, indice) =>{
                    const horario = elemento.querySelector('.Box.jKVshf .Text.kcRyBI')?.textContent.trim();
                    const tempo = elemento.querySelector('.Box.Flex.jTiCHC.cRYpNI.sc-efac74ba-2.gxmYGv.score-box .Text.fjeMtb.currentScore bdi')?.textContent.trim();
                    const jogoInfo = extrairJogo(jogo);
                    const id = campeonatoAtual.indice + "." + indiceJogo;
                    indiceJogo++;
                    return { ...jogoInfo, horario, tempo, id};
                  });

                 if (campeonatoAtual) {
                     campeonatoAtual.jogos.push(...jogos);
                   
                }
            } else if (elemento.classList.contains('gqlAIl') && campeonatoAtual) {
                // Encontrou um divisor de campeonatos
                campeonatos.push(campeonatoAtual);
                campeonatoAtual = null;
            }
        });
    
        // Adiciona o último campeonato se ainda estiver ativo
        if (campeonatoAtual) {
            campeonatos.push(campeonatoAtual);
        }
    
        return campeonatos;
        });
        
    };
      
    console.log(JSON.stringify(dados, null, 2));
    fs.writeFileSync('dados_sofascore.json', JSON.stringify(dados, null, 2));
    await browser.close()
}
// Chamada da função 
apiRasp(url);
//aqui funcuina perfeito 