# --- build ---
FROM node:24-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# 빌드 타임 환경 반영
ARG ENV_NODE=production
RUN rm -rf ./.env.local
COPY ./.env.$ENV_NODE ./.env.production

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- runtime ---
FROM node:24-slim
WORKDIR /app

# standalone 런타임과 정적 파일만 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env* ./

ENV NODE_ENV=production
EXPOSE 3000

# Node 서버 실행
CMD ["node", "server.js"]
