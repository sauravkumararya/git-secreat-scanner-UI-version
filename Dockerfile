# Use a lightweight Node.js image
FROM node:18-alpine

# Install Git (Required for simple-git to work)
RUN apk add --no-cache git

# Set the working directory inside the container
WORKDIR /app

# Copy package files first (to cache dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]