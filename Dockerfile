FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache gcompat
COPY package*.json tsconfig.json drizzle.config.ts ./
COPY src ./src
RUN npm ci --ignore-scripts && npm run build && npm cache clean --force
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

FROM base AS api
EXPOSE 5000
CMD ["node", "/app/dist/index.js"]

FROM base AS migrator
CMD ["sh", "-c", "npx drizzle-kit migrate"]