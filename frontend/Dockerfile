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

# Frontend dev server runs on port 3000
EXPOSE 3000

# Start Vite dev server (host so it's reachable from host machine)
CMD ["npm", "run", "dev"]
