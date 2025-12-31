# Backend Dockerfile
FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and healthcheck tools
RUN apt-get update && \
    apt-get install -y wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install npm dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]

