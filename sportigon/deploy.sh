#!/bin/bash

echo "🏆 Sportigon - Sports Social Network Deployment Script"
echo "======================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
print_status "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi
print_success "Docker is running"

# Check if required files exist
print_status "Checking project structure..."
required_files=(".env.example" "docker-compose.yml" "Dockerfile" "package.json")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file $file not found!"
        exit 1
    fi
done
print_success "Project structure is complete"

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down > /dev/null 2>&1

# Build and start containers
print_status "Building and starting containers..."
if docker-compose up --build -d; then
    print_success "Containers started successfully!"
else
    print_error "Failed to start containers"
    exit 1
fi

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Test backend health
print_status "Testing backend health..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Backend is responding!"

    # Test other endpoints
    print_status "Testing API endpoints..."

    # Test users endpoint
    if curl -f http://localhost:3001/api/users > /dev/null 2>&1; then
        print_success "Users API is working"
    else
        print_warning "Users API not responding"
    fi

    # Test feed endpoint
    if curl -f http://localhost:3001/api/feed > /dev/null 2>&1; then
        print_success "Feed API is working"
    else
        print_warning "Feed API not responding"
    fi

else
    print_warning "Backend health check failed, but containers may still be starting"
fi

# Show container status
print_status "Container status:"
docker-compose ps

# Show access information
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=============================="
echo -e "${BLUE}Access your application:${NC}"
echo "  • Application: http://localhost:3001"
echo "  • Health Check: http://localhost:3001/api/health"
echo "  • API Users: http://localhost:3001/api/users"
echo "  • API Feed: http://localhost:3001/api/feed"
echo ""
echo -e "${BLUE}Database Services:${NC}"
echo "  • MongoDB: localhost:27017"
echo "  • PostgreSQL: localhost:5432"
echo "  • Redis: localhost:6379"
echo "  • Redis Commander: http://localhost:8081"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop: docker-compose down"
echo "  • Restart: docker-compose restart"
echo ""
print_success "Sportigon is ready for development and production use!"