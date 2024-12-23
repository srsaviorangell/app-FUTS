/** @type {import('tailwindcss').Config} */
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
     },
     borderRadius: {
      'custom': '1.25rem', 
    },
    boxShadow: {
      'inner-custom': 'inset 1px 4px 10px 0px rgba(0, 0, 0, 1)', // Adiciona sua sombra interna personalizada
    },
    
    },
  },
  plugins: [],
}
