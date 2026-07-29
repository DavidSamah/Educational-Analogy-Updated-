# Frontend build stage
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Backend build stage
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npx tsc

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install runtime deps
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy built backend
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/data ./data
COPY --from=backend-build /app/backend/.env.example ./.env

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]

