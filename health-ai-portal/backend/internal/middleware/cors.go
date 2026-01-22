package middleware

import (
	"os"
	"strings"

	"github.com/go-chi/cors"
)

func CorsHandler() *cors.Cors {
	// Default origins for local development
	origins := []string{
		"http://localhost:3000",
		"http://localhost:5173",
	}

	// Add production origins from environment
	if allowedOrigins := os.Getenv("ALLOWED_ORIGINS"); allowedOrigins != "" {
		origins = append(origins, strings.Split(allowedOrigins, ",")...)
	}

	// In production, allow same-origin requests (frontend served by same server)
	if os.Getenv("DATABASE_URL") != "" {
		origins = append(origins, "*")
	}

	return cors.New(cors.Options{
		AllowedOrigins:   origins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	})
}
