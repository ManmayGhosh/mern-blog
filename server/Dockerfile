FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

# Uploads need to persist across container restarts — mount a volume here in compose
RUN mkdir -p uploads/posts uploads/avatars

EXPOSE 5000

CMD ["node", "server.js"]
