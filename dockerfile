# Use uma imagem Python oficial com compatibilidade multiplataforma
FROM node:22


WORKDIR /app

COPY package*.json ./
RUN npm install

COPY API-raspagem ./

EXPOSE 8081

CMD ["node", "api.js"]