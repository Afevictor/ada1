FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first (better caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the Vite app
RUN npm run build

# Expose the port EasyPanel will use
EXPOSE 3000

# Run the app and listen on all interfaces
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
