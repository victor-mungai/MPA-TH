# syntax=docker/dockerfile:1.7

FROM node:24.21.0-alpine3.24 AS development-dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM development-dependencies AS test
COPY src ./src
COPY test ./test
COPY eslint.config.js ./
RUN npm run lint && npm test

FROM node:24.21.0-alpine3.24 AS production-dependencies
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:24.21.0-alpine3.24 AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
