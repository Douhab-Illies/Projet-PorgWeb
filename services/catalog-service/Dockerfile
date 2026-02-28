FROM node:20-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

COPY src ./src
COPY proto ./proto

ENV NODE_ENV=production
EXPOSE 3001 50051
CMD ["node","src/index.js"]
