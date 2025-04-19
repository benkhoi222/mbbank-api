# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy compiled code and node_modules from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose the port the app runs on (match PORT in .env)
EXPOSE 3000

# Define the command to run the application
CMD [ "node", "dist/index.js" ] 