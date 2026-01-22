package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"health-ai-portal/internal/config"
	"health-ai-portal/internal/database"
	"health-ai-portal/internal/handlers"
	"health-ai-portal/internal/middleware"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if exists
	godotenv.Load()

	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := database.New(cfg.DatabaseURL())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Run migrations
	migrationsPath := filepath.Join("internal", "database", "migrations")
	if _, err := os.Stat(migrationsPath); os.IsNotExist(err) {
		// Try alternative path for Docker
		migrationsPath = "/app/internal/database/migrations"
	}
	if err := db.RunMigrations(migrationsPath); err != nil {
		log.Printf("Warning: Failed to run migrations: %v", err)
	}

	// Initialize handlers
	supplementHandler := handlers.NewSupplementHandler(db)
	goalHandler := handlers.NewGoalHandler(db)
	labHandler := handlers.NewLabHandler(db)

	// Setup router
	r := chi.NewRouter()

	// Middleware
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.RealIP)
	r.Use(middleware.CorsHandler().Handler)

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// API routes
	r.Route("/api", func(r chi.Router) {
		// Supplements
		r.Route("/supplements", func(r chi.Router) {
			r.Get("/", supplementHandler.List)
			r.Post("/", supplementHandler.Create)
			r.Get("/schedule", supplementHandler.GetSchedule)
			r.Get("/by-category", supplementHandler.GetByCategory)
			r.Get("/{id}", supplementHandler.Get)
			r.Put("/{id}", supplementHandler.Update)
			r.Delete("/{id}", supplementHandler.Delete)
		})

		// Goals
		r.Route("/goals", func(r chi.Router) {
			r.Get("/", goalHandler.List)
			r.Post("/", goalHandler.Create)
			r.Get("/{id}", goalHandler.Get)
			r.Put("/{id}", goalHandler.Update)
			r.Delete("/{id}", goalHandler.Delete)
		})

		// Labs
		r.Route("/labs", func(r chi.Router) {
			r.Get("/", labHandler.List)
			r.Post("/", labHandler.Create)
			r.Get("/trends", labHandler.GetTrends)
			r.Get("/marker/{name}", labHandler.GetByMarker)
			r.Get("/{id}", labHandler.Get)
			r.Put("/{id}", labHandler.Update)
			r.Delete("/{id}", labHandler.Delete)
		})

		// Dashboard summary
		r.Get("/dashboard/summary", func(w http.ResponseWriter, r *http.Request) {
			// TODO: Implement dashboard summary
			handlers.NewSupplementHandler(db) // placeholder
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"status": "ok", "message": "Dashboard endpoint"}`))
		})
	})

	// Start server
	addr := ":" + cfg.ServerPort
	log.Printf("Server starting on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
