# Simple Dockerfile for Sportigon Backend Development

FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files for better layer caching
COPY backend/package*.json ./backend/

# Install all dependencies (including dev dependencies for tsx)
RUN cd backend && npm install

# Copy source code
COPY backend ./backend/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S sportigon -u 1001

# Set proper ownership
RUN chown -R sportigon:nodejs /app
USER sportigon

# Expose ports
EXPOSE 3001 9229

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the application
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npm", "run", "dev", "--workspace=backend"]