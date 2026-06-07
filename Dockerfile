FROM node:20-alpine AS client
WORKDIR /build
COPY Client/package*.json ./
RUN npm install
COPY Client/ .
RUN npm run build

FROM node:20-alpine AS server
WORKDIR /app
COPY Server/package*.json ./
RUN npm install
COPY Server/ .

COPY --from=client /build/dist ./public

ENV PORT=5001
EXPOSE 5001
CMD ["node", "app.js"]