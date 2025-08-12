FROM node:20

# Install pnpm
RUN npm install -g pnpm@9.10.0

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Set dummy environment variables for build time only
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV JWT_SECRET="dummy-jwt-secret-for-build"
ENV COOKIE_SECRET="dummy-cookie-secret-for-build"

# Build the application
RUN pnpm run build

# Create start script that will use real environment variables
RUN echo '#!/bin/sh' > /app/docker-start.sh && \
    echo 'echo "Starting Medusa Backend..."' >> /app/docker-start.sh && \
    echo 'echo "PORT: ${PORT:-9000}"' >> /app/docker-start.sh && \
    echo 'echo "NODE_ENV: production"' >> /app/docker-start.sh && \
    echo 'echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo "Yes" || echo "No")"' >> /app/docker-start.sh && \
    echo '' >> /app/docker-start.sh && \
    echo 'cd /app/.medusa/server' >> /app/docker-start.sh && \
    echo 'exec npx medusa start --port=${PORT:-9000}' >> /app/docker-start.sh && \
    chmod +x /app/docker-start.sh

# Reset environment variables (they will be set by Railway at runtime)
ENV DATABASE_URL=""
ENV JWT_SECRET=""
ENV COOKIE_SECRET=""
ENV NODE_ENV=production

EXPOSE 9000

CMD ["/app/docker-start.sh"]