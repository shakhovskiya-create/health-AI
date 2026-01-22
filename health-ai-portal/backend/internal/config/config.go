package config

import (
	"os"
)

type Config struct {
	DBHost        string
	DBPort        string
	DBUser        string
	DBPassword    string
	DBName        string
	ServerPort    string
	JWTSecret     string
	ClaudeAPIKey  string
}

func Load() *Config {
	return &Config{
		DBHost:       getEnv("DB_HOST", "localhost"),
		DBPort:       getEnv("DB_PORT", "5432"),
		DBUser:       getEnv("DB_USER", "healthai"),
		DBPassword:   getEnv("DB_PASSWORD", "healthai"),
		DBName:       getEnv("DB_NAME", "healthai"),
		ServerPort:   getEnv("SERVER_PORT", "8080"),
		JWTSecret:    getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		ClaudeAPIKey: getEnv("CLAUDE_API_KEY", ""),
	}
}

func (c *Config) DatabaseURL() string {
	return "postgres://" + c.DBUser + ":" + c.DBPassword + "@" + c.DBHost + ":" + c.DBPort + "/" + c.DBName + "?sslmode=disable"
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
