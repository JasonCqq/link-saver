FROM mcr.microsoft.com/playwright:v1.57.0-noble

# Replace the image's Node with Node 26 from the official image
COPY --from=node:26-bookworm /usr/local/bin/node /usr/local/bin/node
COPY --from=node:26-bookworm /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
 && node -v && npm -v

WORKDIR /Backend

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "devstart"]