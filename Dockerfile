FROM node:lts-slime AS builder
WORKDIR /app
COPY package.json ./
RUN pnpm install
COPY . .
RUN  pnpm run build --target=production

FROM node:lts-slime AS production
USER node:node
WORKDIR /app
COPY --from=builder --chown=node:node /app/build ./build
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json .
CMD ["node","build"]