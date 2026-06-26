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

ENV PORT=5002
EXPOSE 5002
CMD ["node", "app.js"]