FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm install || true

WORKDIR /app/backend
RUN npm install
COPY backend/prisma ./prisma
RUN npx prisma generate

WORKDIR /app/frontend
RUN npm install

WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend

WORKDIR /app/frontend
ENV VITE_API_BASE_URL=/api
RUN npm run build


WORKDIR /app/backend
RUN npm run build


FROM node:22-alpine AS production
WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/backend/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/frontend/dist ./public
COPY backend/prisma ./prisma

RUN mkdir -p /app/config
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"]
