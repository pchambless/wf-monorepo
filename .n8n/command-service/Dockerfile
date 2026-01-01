FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    mysql-client \
    bash \
    curl \
    openssh-client \
    docker-cli

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the service
CMD ["npm", "start"]