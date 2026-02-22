# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# This service listens on port 5000 (set PORT in docker-compose)
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
