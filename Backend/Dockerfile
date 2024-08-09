FROM node:20.12.1

WORKDIR /Backend

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/ 

RUN npx prisma generate

COPY . .

ENV PORT = 8080

EXPOSE 8080

CMD ["npm", "run", "devstart"]