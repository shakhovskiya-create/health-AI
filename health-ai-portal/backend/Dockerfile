FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

# Final stage
FROM alpine:3.19

WORKDIR /app

# Copy binary and migrations
COPY --from=builder /app/server .
COPY --from=builder /app/internal/database/migrations ./internal/database/migrations

# Expose port
EXPOSE 8080

# Run
CMD ["./server"]
