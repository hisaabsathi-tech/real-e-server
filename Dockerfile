FROM node:latest AS builder

WORKDIR /app

COPY . .

RUN npx prisma generate
RUN npm install

RUN npm run build

FROM node:latest

WORKDIR /app

COPY --from=builder /app/dist ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./generated
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["node", "index.js"]