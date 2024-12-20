const express = require('express');
const app = express();
const { engine } = require('express-handlebars'); // Usando 'engine' para versões mais recentes
const path = require('path'); // Usado para manipulação de caminhos de arquivos


app.use(express.static(path.join(__dirname, '..', 'public')));
// Definindo onde estão as views
app.set('views', path.join(__dirname, '..', 'views')); // Caminho correto para a pasta views na raiz
// Definindo o template engine (Handlebars)
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Rota para a página inicial
app.get('/', (req, res) => {
    res.render('../views/layouts/index');
});

const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`Servidor aberto para visualizar na porta ${PORTA}`);
});
