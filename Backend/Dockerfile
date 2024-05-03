FROM node:20.12.1

WORKDIR /Backend

COPY package*.json ./

RUN npm install

RUN npx playwright@1.43.1 install --with-deps chromium

COPY prisma ./prisma/ 

RUN npx prisma generate

COPY . .

ENV PORT = 8080

EXPOSE 8080

CMD ["npm", "run", "devstart"]