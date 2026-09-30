FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=4030 HOSTNAME=0.0.0.0 TESS_CACHE=/app/tess
RUN addgroup -S fuchs && adduser -S fuchs -G fuchs && mkdir -p /app/tess && chown fuchs:fuchs /app/tess
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER fuchs
EXPOSE 4030
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:4030/robots.txt >/dev/null || exit 1
CMD ["node", "server.js"]
