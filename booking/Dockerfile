FROM node:20-bullseye
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5003
CMD ["node", "server.js"]
FROM node:18
WORKDIR /app

