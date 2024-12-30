
/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ["./views/**/*.handlebars",
    "./views/**/*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        ubuntu: ['Ubuntu', 'sans-serif'],
      },
      colors: {
        colorapp: '#333030',
        cormenu: '#403C3C',
        corletreiro:'#404040',
        'corbordas': '#6D6D6F',
     },
     borderRadius: {
      'custom': '1.25rem', 
    },
    boxShadow: {
      'inner-custom': 'inset 1px 4px 10px 0px rgba(0, 0, 0, 1)', // Adiciona sua sombra interna personalizada
    },gridTemplateRows: {
      // Adiciona uma configuração para 19 linhas
      '19': 'repeat(19, minmax(0, 1fr))',
    },
    backgroundImage: {
      'gradiente1': 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 29%, rgba(0, 0, 0, 0.7) 43%, rgba(0, 0, 0, 1) 100%), #615f5f',
    },
    
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.clip-home': {
          'clip-path': 'polygon(0 0, 100% 0, 0 100%)',
        },
        '.clip-visitor': {
          'clip-path': 'polygon(100% 0, 100% 100%, 0 100%)',
        },
      });
    }),
  ],
}
