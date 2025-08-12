FROM node:20-alpine

# Install dependencies for building
RUN apk add --no-cache python3 make g++ curl

# Install pnpm
RUN npm install -g pnpm@9.10.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Set production environment
ENV NODE_ENV=production

# Create a startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Starting Medusa server..."' >> /app/start.sh && \
    echo 'echo "PORT: ${PORT:-9000}"' >> /app/start.sh && \
    echo 'echo "NODE_ENV: ${NODE_ENV}"' >> /app/start.sh && \
    echo 'cd /app/.medusa/server' >> /app/start.sh && \
    echo 'exec npx medusa start --port=${PORT:-9000}' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port (Railway will override this)
EXPOSE 9000

# Start the application using our script
CMD ["/app/start.sh"]