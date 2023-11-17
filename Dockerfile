# FROM node:20-slim AS builder
# RUN npm i -g pnpm

# FROM builder AS dependencies

# WORKDIR /app
# COPY package.json ./
# # COPY pnpm-lock.yaml ./
# RUN pnpm install

# FROM builder AS build

# WORKDIR /app
# COPY . .
# COPY --from=dependencies /app/node_modules ./node_modules
# RUN pnpm build
# RUN pnpm prune --prod

# FROM builder AS production

# USER node:node
# WORKDIR /app
# COPY --from=build --chown=node:node /app/build ./build
# COPY --from=build --chown=node:node /app/node_modules ./node_modules
# COPY --chown=node:node package.json .
# CMD ["node","build"]

# === Builder stage ===
FROM node:20-slim as builder
WORKDIR /app

# Copy the source code and all files to the container (reminder: create a .dockerignore)
COPY . .

# Enable corepack for pnpm
RUN corepack enable

# Install all dependencies, but freeze lock-file if it already exists. 
RUN if [ -f "pnpm-lock.yaml" ]; then pnpm i --frozen-lockfile; else pnpm i; fi

# Fix potential security issues
RUN pnpm audit --fix
    
# Build app
RUN pnpm build

# === Deployment stage ===
FROM builder as deploy
WORKDIR /app

# Copy dependency-lists from builder stage
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Enable corepack for pnpm
RUN corepack enable

# Install dependencies, freeze lockfile, no devDependencies, no scripts
RUN pnpm i --frozen-lockfile --prod --ignore-scripts

# Fix potential security issues
RUN pnpm audit --fix

# Copy built app from builder stage to /app
COPY --from=builder /app/build/ ./

EXPOSE 3000
CMD ["node", "./index.js"]
