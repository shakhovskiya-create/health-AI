.PHONY: dev up down logs clean seed backend-dev frontend-dev

# Development
dev:
	docker-compose up -d postgres
	@echo "Waiting for PostgreSQL..."
	@sleep 3
	@echo "Starting backend..."
	cd backend && go run ./cmd/server &
	@echo "Starting frontend..."
	cd frontend && npm run dev

# Docker commands
up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v

# Backend only
backend-dev:
	cd backend && go run ./cmd/server

# Frontend only
frontend-dev:
	cd frontend && npm run dev

# Database
seed:
	docker-compose exec postgres psql -U healthai -d healthai -f /docker-entrypoint-initdb.d/seed.sql

# Build
build:
	docker-compose build

# Install dependencies
install:
	cd backend && go mod download
	cd frontend && npm install

# Run migrations
migrate:
	cd backend && go run ./cmd/server migrate

# Format code
fmt:
	cd backend && go fmt ./...
	cd frontend && npm run lint -- --fix

# Production build for Replit
build-prod:
	@echo "Building frontend..."
	cd frontend && npm install && npm run build
	@echo "Building backend..."
	cd backend && CGO_ENABLED=0 go build -o server cmd/server/main.go
	@echo "Build complete!"

# Run production (for Replit)
run-prod:
	cd backend && ./server

# Replit deployment
replit-deploy: build-prod
	@echo "Ready for Replit deployment!"
