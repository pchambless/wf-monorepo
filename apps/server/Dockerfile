# Use official Node.js runtime as base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json first (for better Docker layer caching)
COPY package.json ./

# Copy the packages directory (for monorepo shared dependencies)
COPY ../../packages ./packages

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the application
CMD ["npm", "start"]