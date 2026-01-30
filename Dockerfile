FROM node:22-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json ./
COPY scripts ./scripts
COPY src ./src
COPY docs ./docs
COPY config ./config
RUN npm i --no-audit --no-fund
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/config ./config
CMD ["node", "dist/cli.js", "run"]
