package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"health-ai-portal/internal/ai"
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
	dbURL := cfg.GetDatabaseURL()
	log.Printf("Connecting to database...")
	db, err := database.New(dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Printf("Database connected successfully")

	// Run migrations only for local development (skip if using external DB like Supabase)
	if cfg.DatabaseURL == "" && (cfg.DBHost == "localhost" || cfg.DBHost == "postgres") {
		migrationsPath := filepath.Join("internal", "database", "migrations")
		if _, err := os.Stat(migrationsPath); os.IsNotExist(err) {
			migrationsPath = "/app/internal/database/migrations"
		}
		if err := db.RunMigrations(migrationsPath); err != nil {
			log.Printf("Warning: Failed to run migrations: %v", err)
		}
	} else {
		log.Printf("Skipping migrations (external database)")
	}

	// Initialize Claude AI client
	claudeClient := ai.NewClaudeClient(cfg.ClaudeAPIKey)

	// Initialize handlers
	supplementHandler := handlers.NewSupplementHandler(db)
	goalHandler := handlers.NewGoalHandler(db)
	labHandler := handlers.NewLabHandler(db)
	interactionHandler := handlers.NewInteractionHandler(db)
	aiHandler := handlers.NewAIHandler(db, claudeClient)
	reminderHandler := handlers.NewReminderHandler(db)

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
			r.Post("/import", labHandler.Import)
			r.Get("/trends", labHandler.GetTrends)
			r.Get("/marker/{name}", labHandler.GetByMarker)
			r.Get("/{id}", labHandler.Get)
			r.Put("/{id}", labHandler.Update)
			r.Delete("/{id}", labHandler.Delete)
		})

		// Interactions
		r.Route("/interactions", func(r chi.Router) {
			r.Get("/", interactionHandler.List)
			r.Post("/", interactionHandler.Create)
			r.Get("/{id}", interactionHandler.Get)
			r.Put("/{id}", interactionHandler.Update)
			r.Delete("/{id}", interactionHandler.Delete)
		})

		// AI
		r.Route("/ai", func(r chi.Router) {
			r.Post("/analyze", aiHandler.Analyze)
			r.Get("/analysis/{cycleId}", aiHandler.GetAnalysis)
		})

		// Reminders
		r.Route("/reminders", func(r chi.Router) {
			r.Get("/", reminderHandler.List)
			r.Post("/", reminderHandler.Create)
			r.Get("/today", reminderHandler.GetToday)
			r.Get("/{id}", reminderHandler.Get)
			r.Put("/{id}", reminderHandler.Update)
			r.Delete("/{id}", reminderHandler.Delete)
			r.Post("/{id}/toggle", reminderHandler.Toggle)
		})

		// Dashboard summary
		r.Get("/dashboard/summary", func(w http.ResponseWriter, r *http.Request) {
			// TODO: Implement dashboard summary
			handlers.NewSupplementHandler(db) // placeholder
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"status": "ok", "message": "Dashboard endpoint"}`))
		})
	})

	// Serve static files in production (frontend build)
	staticDir := os.Getenv("STATIC_DIR")
	if staticDir == "" {
		staticDir = "../frontend/dist"
	}

	// Check if static dir exists
	if _, err := os.Stat(staticDir); err == nil {
		log.Printf("Serving static files from %s", staticDir)

		// Serve static files
		fs := http.FileServer(http.Dir(staticDir))
		r.Handle("/*", http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			// Try to serve static file
			path := staticDir + req.URL.Path
			if _, err := os.Stat(path); os.IsNotExist(err) {
				// If file doesn't exist, serve index.html (SPA routing)
				http.ServeFile(w, req, staticDir+"/index.html")
				return
			}
			fs.ServeHTTP(w, req)
		}))
	}

	// Start server
	addr := ":" + cfg.ServerPort
	log.Printf("Server starting on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
