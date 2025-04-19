# Use an official Node.js runtime (Debian-based slim version for glibc compatibility)
FROM node:18-slim AS builder

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
FROM node:18-slim

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy compiled code and node_modules from the builder stage
COPY --from=builder /app/dist ./dist
# We copy node_modules from builder now because prod install might miss native deps
# Or alternatively, copy only dist and run npm install --only=production here if ONNX builds correctly
COPY --from=builder /app/node_modules ./node_modules

# Expose the port the app runs on (match PORT in .env)
EXPOSE ${PORT:-3000}

# Define the command to run the application
CMD [ "node", "dist/index.js" ] 