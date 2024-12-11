const puppeteer = require('puppeteer');

const url = "https://www.sofascore.com/"; // URL do site para raspagem

const seletores = {
    contgeral: '.Box.klGMtt ',
    separdor: '.HorizontalDivider.gqlAIl',
    ContCampenalto: '.Box.klGMtt >.Box.Flex.cBIkhT.jLRkRA',
    nomePais: 'Box.Flex.eHnLBZ.kkrevz > a > .Text.cbiYVh',
    contPaisOuLiga: '.Box.klGMtt >.Box.Flex.cBIkhT.jLRkRA > .Box.Flex.dOBJED.hURKmT',
    paisOuLiga: '.Box.Flex.dOBJED.hURKmT .Text.bZlPcX', // Seletor ajustado
    imgPais: '.Box.Flex.cBIkhT.jLRkRA img.Img.ccYJkt, .Box.Flex.cBIkhT.jLRkRA img.Img.kMzyHA, .Box.Flex.cBIkhT.jLRkRA img.Img.ccYJkt ',
};

async function apiRasp(url) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url, { timeout: 60000 });

    // Clique ao vivo 
    const aoVivo = '.Chip.elpdkn';
    
    await page.evaluate((selector) => {
        const button = document.querySelector(selector);
        if (button) {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }
    }, aoVivo);
    console.log('click ok')

    // Aguardar o carregamento completo da página, especialmente se houver conteúdo dinâmico

    // Captura os nomes das ligas
    const ligas = await page.evaluate((seletores) => {
        const ligasElems = document.querySelectorAll(seletores.paisOuLiga);
        const nomesLigas = [];

        ligasElems.forEach((liga) => {
            const nomeLiga = liga.textContent.trim();
            if (nomeLiga) {
                nomesLigas.push(nomeLiga);  // Adiciona o nome da liga ao array
            }
        });

        return nomesLigas;
    }, seletores);

    console.log('Ligas encontradas:', ligas);

    // Fechar o navegador
    await browser.close();
}

// Chamar a função para rodar o processo de raspagem
apiRasp(url);
