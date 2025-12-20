# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and healthcheck tools
RUN npm install && \
    apk add --no-cache wget

# Copy application files
COPY . .

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]

