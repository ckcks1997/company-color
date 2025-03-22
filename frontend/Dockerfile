# 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY .env* ./
COPY ecosystem.config.js ./
RUN npm install
COPY . .
RUN npm run build

# 실행 스테이지
FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/ecosystem.config.js ./
COPY --from=builder /app/.env* ./

RUN npm install --production && \
    npm install -g pm2

EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
