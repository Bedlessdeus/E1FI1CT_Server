FROM node:24-alpine AS build-stage

WORKDIR /app

RUN apk add --no-cache \
    npm


COPY package*.json ./
COPY src/lib/server/sql/* ./lib/server/sql/
COPY svelte.config.js ./

RUN npm install

COPY . .


RUN npm run build

RUN npm prune --omit=dev

FROM node:24-alpine AS runtime-stage

WORKDIR /app

COPY --from=build-stage /app/build ./build
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/package.json ./package.json
COPY --from=build-stage /app/package-lock.json ./package-lock.json
COPY --from=build-stage /app/svelte.config.js ./svelte.config.js


EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "build/index.js"]
