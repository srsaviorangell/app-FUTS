const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const url = "https://www.sofascore.com/";

const seletores = {
    dadosJogos: '.Box.Flex.dvkfVt',
    hora: '.Text.kcRyBI',
    escuH1: '.Box.hYFYfq',
    nomeH1: '.Text.ezSveL',
    placarH1: '.Text.cvwZXc.currentScore',
    escuH2: '.Box.hYFYfq',
    nomeH2: '.Text.ezSveL',
    placarH2: '.Box.Flex.dvkfVt',
    timeJogo: '.Box.Flex.jTiCHC.cRYpNI.sc-efac74ba-2.gxmYGv.score-box'
};

async function apiRasp(url) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    const selector = '.dmnHLc'; // Seletor do botão para abrir eventos ao vivo

    console.log('Seletor encontrado. Simulando o clique...');

    // Simule o clique no botão
    await page.evaluate((selector) => {
        const button = document.querySelector(selector);
        if (button) {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }
    }, selector);

    console.log("Clique simulado");

    const visuDate = '.Box.Flex.cBIkhT'; // Seletor do elemento de dados
    await page.waitForSelector(visuDate, { timeout: 7000 });

    // Função para capturar dados com base no seletor
    const capturarDados = async (seletor) => {
        return await page.evaluate((seletor) => {
            const data = [];
            document.querySelectorAll(seletor).forEach(item => {
                data.push({
                    text: item.innerText
                });
            });
            return data;
        }, seletor);
    };

    // Função para combinar os dados com base no seletor principal
    const combinarDados = async (seletorBase) => {
        const itens = await capturarDados(seletorBase);
        const dadosCompletos = [];

        for (const item of itens) {
            const dados = {};

            for (const [descricao, seletor] of Object.entries(seletores)) {
                const dadosItem = await capturarDados(seletor);
                dados[descricao] = dadosItem; // Assume que dadosItem é uma lista de objetos com uma propriedade 'text'
            }

            dadosCompletos.push({
                item: item.text,
                dados: dados
            });
        }

        return dadosCompletos;
    };

    // Capture e combine os dados
    const dados = await combinarDados(visuDate);
    console.log(dados); 

    // Fechar o navegador
    await browser.close();
}

apiRasp(url);
