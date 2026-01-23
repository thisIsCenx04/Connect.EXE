FROM node:20-alpine

WORKDIR /app

COPY chat-service/package.json ./
RUN npm install --production

COPY chat-service/src ./src

EXPOSE 8090

CMD ["npm", "start"]
