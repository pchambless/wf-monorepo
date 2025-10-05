# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy the packages directory first (for monorepo shared dependencies)
COPY ../../packages ./packages

# Copy package.json for the client
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage - uses nginx to serve static files
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
