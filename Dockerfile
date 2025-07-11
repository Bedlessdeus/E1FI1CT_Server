FROM node:24-alpine AS build-stage

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    build-base \
    npm

COPY package*.json ./
COPY svelte.config.js ./
COPY drizzle.config.ts ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY websocket-server.js ./

RUN npm install

COPY . .

ENV DATABASE_URL=local.db

RUN npm run build

RUN npm prune --omit=dev

FROM node:24-alpine AS runtime-stage

WORKDIR /app

RUN apk add --no-cache \
    cairo \
    pango

COPY --from=build-stage /app/build ./build
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/package.json ./package.json
COPY --from=build-stage /app/package-lock.json ./package-lock.json
COPY --from=build-stage /app/svelte.config.js ./svelte.config.js
COPY --from=build-stage /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build-stage /app/drizzle ./drizzle
COPY --from=build-stage /app/production-server.js ./production-server.js
COPY --from=build-stage /app/src/lib/server/db ./src/lib/server/db
COPY --from=build-stage /app/websocket-server.js ./websocket-server.js

ENV DATABASE_URL=local.db

RUN touch local.db && npm run db:migrate && npm run db:push

EXPOSE 3000
EXPOSE 3001

ENV NODE_ENV=production


CMD ["npm", "run", "prod:all"]