const express = require('express');
const fs = require('fs');
const app = express();
const puppeteer = require('puppeteer');
const schedule = require('node-schedule');


const url = "https://www.sofascore.com/";

const seletores = {
    contgeral:'.Box.klGMtt ',
    separdor:'.HorizontalDivider.gqlAIl',
    ContCampenalto:'.Box.klGMtt >.Box.Flex.cBIkhT.jLRkRA',
    nomePais: 'Box.Flex.eHnLBZ.kkrevz > a > .Text.cbiYVh',
    contPaisOuLiga:'.Box.klGMtt >.Box.Flex.cBIkhT.jLRkRA > .Box.Flex.dOBJED.hURKmT',
    paisOuLiga: '.Box.Flex.dOBJED.hURKmT .Text.bZlPcX', 
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
    const aoVivo = '.Chip.elpdkn';
    await page.waitForSelector(aoVivo, { visible: true });

    await page.evaluate((selector) => {
        const button = document.querySelector(selector);
        if (button) {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }
    }, aoVivo);
    console.log('click ok');

     // Aguarde o carregamento dos campeonatos
     await page.waitForSelector(seletores.ContJogos, { timeout:30000 });
     console.log('Seletor encontrado , cont pais');
     await page.waitForSelector(seletores.contHorarioTempo, { timeout: 10000 });
     console.log('Seletor encontrado , horario');

     await page.waitForSelector(seletores.contPlacar, { timeout: 10000 });
     console.log('Seletor encontrado , placar');

     await page.waitForSelector(seletores.paisOuLiga , { timeout: 10000 });
     console.log('Seletor encontrado , campenalto ');

     // Inicializa a variável dados aqui
     let dados = [];
    const jogosVisibles = new Set([]); // Set para garantir que os jogos não se repitam


     const scrollHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
     });

     const viewportHeight = await page.evaluate(() => {
         return window.innerHeight;
     });

     const scrollStep = 700; // ajuste esse valor para controlar a velocidade do scroll

     for (let i = 0; i < scrollHeight; i += scrollStep) {
        // Fazendo scroll progressivamente
        await page.evaluate(scrollPos => window.scrollTo(0, scrollPos), i);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperando o carregamento do conteúdo

         const novosDados = await page.evaluate(() => {
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
             function divisor (){
                const divisorCam = document.querySelector('.HorizontalDivider')
                if (divisorCam){
                    return divisorCam
                }else{
                    return null
                }
            } ;
             document.querySelectorAll('.Box.klGMtt, .gqlAIl', divisor)?.forEach((elemento) => {
                if (elemento.querySelector('.Text.bZlPcX')) {
                    // Encontrou um novo campeonato
                    const nomeCampeonato = elemento.querySelector('.Text.bZlPcX')?.textContent.trim();
                    const imgP = elemento.querySelector('.Box.Flex.cBIkhT.jLRkRA img.Img.ccYJkt, .Box.Flex.cBIkhT.jLRkRA img.Img.kMzyHA, .Box.Flex.cBIkhT.jLRkRA img.Img.ccYJkt ');
                    const imgPSrc = imgP ? imgP.src : '';
            
                    // Verifica se o campeonato já foi adicionado
                    if (nomeCampeonato && !campeonatos.some(c => c.nome === nomeCampeonato)) {
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
                        indiceJogo = 1;
                    }
                } else if (elemento.querySelectorAll('.Box.dtLxRI').length > 0) {
                    // Encontrou jogos
                    const jogos = Array.from(elemento.querySelectorAll('.Box.dtLxRI')).map((jogo, indice) => {
                        const horario = elemento.querySelector('.Box.jKVshf .Text.kcRyBI')?.textContent.trim();
                        const tempo = elemento.querySelector('.Box.Flex.jTiCHC.cRYpNI.sc-efac74ba-2.gxmYGv.score-box .Text.fjeMtb.currentScore bdi')?.textContent.trim();
                        const jogoInfo = extrairJogo(jogo);
                        const id = campeonatoAtual ? campeonatoAtual.indice + "." + indiceJogo : '';
            
                        // Verifica se o jogo já foi adicionado
                        if (campeonatoAtual && !campeonatoAtual.jogos.some(j => j.id === id)) {
                            indiceJogo++;
                            return { ...jogoInfo, horario, tempo, id };
                        } else {
                            return null; // Retorna null se o jogo já existe
                        }
                    }).filter(jogo => jogo !== null); // Filtra os jogos nulos
            
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

         // Adiciona novos dados à variável dados
         dados.push(...novosDados);
     }

    //  console.log(JSON.stringify(dados, null, 2));
     fs.writeFileSync('dados_sofascore.json', JSON.stringify(dados, null, 2));
     await browser.close();
}

// Chamada da função

async function leitura (){
const caminhoArquivo = './dados_sofascore.json';
 function leDados(caminhoArquivo) {
     const dadosLido =  fs.readFileSync(caminhoArquivo, 'utf8');
    return JSON.parse(dadosLido);
  }

//const dados = leDados(caminhoArquivo);
// console.log(dados);
//fs.writeFileSync('dadosLeitura5.json', JSON.stringify(dados, null, 2));
const organizarDadosCampeonalto = await leDados(caminhoArquivo)
const dadosMapeadoNome = new Set();

// Filtragem inicial para itens válidos e duplicatas no array 'jogos'
const dadosMapeados = new Set(
  organizarDadosCampeonalto
    .map(item => {
      // Verifica se o item tem 'jogos' e pelo menos um jogo
      if (!item.jogos || item.jogos.length === 0) {
        return null; // Ignorar itens inválidos
      }
      
      // Verifica se o nome do campeonato já foi processado
      if (dadosMapeadoNome.has(item.nome)) {
        return null; // Ignorar duplicatas pelo nome
      }

      // Adiciona o nome do campeonato ao conjunto para controle
      dadosMapeadoNome.add(item.nome);

      // Serializa o item para o conjunto principal
      return JSON.stringify(item);
    })
    .filter(item => item !== null) // Remove itens nulos
);

const dadosSimplificados = [...dadosMapeados].map(item =>JSON.parse(item));

console.log(dadosSimplificados.length);
// Escreve os dados processados em um novo arquivo
fs.writeFileSync('dadosMap1.JSON', JSON.stringify(dadosSimplificados, null, 2));
}




async function main(){
    console.log("Iniciando raspagem...");
    await apiRasp(url); // Aguarda a conclusão da raspagem
    console.log("Raspagem concluída! Iniciando leitura...");
    await leitura(); // Somente agora realiza a leitura
    console.log("Leitura concluída!");
};
main();

s.scheduleJob('0 */1 * * * * ',()=>{
    console.log ('rodando a cada 45 segundos ');
    main();
});
