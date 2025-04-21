FROM node:20-alpine AS builder

ENV NODE_ENV=development

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma

RUN npm install --legacy-peer-deps

COPY . .

RUN chown -R node:node /app

USER node

RUN npx prisma generate && npm run build

RUN npm prune --omit=dev

FROM node:20-alpine

ENV NODE_ENV=production

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/prisma/ ./prisma/
COPY --from=builder /app/.env ./

RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
