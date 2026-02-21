# Dockerfile — Backend
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create the data directory for SQLite
RUN mkdir -p /app/data

# Expose the API port
EXPOSE 3001

CMD ["node", "index.js"]
