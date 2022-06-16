# This example dockerfile should for most NodeJS game servers
# Just place it next to your package.json and include it in your shipment to us
FROM node:16-alpine
COPY package* .
RUN npm ci
COPY . .
RUN npm run build
CMD node dist/server.js