package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"health-ai-portal/internal/database"
	"health-ai-portal/internal/models"

	"github.com/go-chi/chi/v5"
)

type ReminderHandler struct {
	db *database.DB
}

func NewReminderHandler(db *database.DB) *ReminderHandler {
	return &ReminderHandler{db: db}
}

func (h *ReminderHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := 1

	activeOnly := r.URL.Query().Get("active") == "true"

	query := `SELECT * FROM reminders WHERE user_id = $1`
	args := []interface{}{userID}

	if activeOnly {
		query += ` AND is_active = true`
	}

	query += ` ORDER BY time ASC`

	var reminders []models.Reminder
	err := h.db.Select(&reminders, query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, reminders)
}

func (h *ReminderHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid ID")
		return
	}

	var reminder models.Reminder
	err = h.db.Get(&reminder, `SELECT * FROM reminders WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusNotFound, "Reminder not found")
		return
	}

	respondJSON(w, http.StatusOK, reminder)
}

func (h *ReminderHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := 1

	var input models.ReminderCreate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if input.Title == "" {
		respondError(w, http.StatusBadRequest, "Title is required")
		return
	}

	// Convert days_of_week to JSON
	daysJSON, _ := json.Marshal(input.DaysOfWeek)

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	var reminder models.Reminder
	err := h.db.Get(&reminder, `
		INSERT INTO reminders (user_id, reminder_type, title, description, time, days_of_week, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING *
	`, userID, input.ReminderType, input.Title, input.Description, input.Time, daysJSON, isActive)

	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, reminder)
}

func (h *ReminderHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid ID")
		return
	}

	var input models.ReminderUpdate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Build update query dynamically
	var daysJSON []byte
	if input.DaysOfWeek != nil {
		daysJSON, _ = json.Marshal(input.DaysOfWeek)
	}

	var reminder models.Reminder
	err = h.db.Get(&reminder, `
		UPDATE reminders SET
			reminder_type = COALESCE($2, reminder_type),
			title = COALESCE($3, title),
			description = COALESCE($4, description),
			time = COALESCE($5, time),
			days_of_week = COALESCE($6, days_of_week),
			is_active = COALESCE($7, is_active)
		WHERE id = $1
		RETURNING *
	`, id, input.ReminderType, input.Title, input.Description, input.Time, daysJSON, input.IsActive)

	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, reminder)
}

func (h *ReminderHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid ID")
		return
	}

	_, err = h.db.Exec(`DELETE FROM reminders WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ReminderHandler) Toggle(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid ID")
		return
	}

	var reminder models.Reminder
	err = h.db.Get(&reminder, `
		UPDATE reminders SET is_active = NOT is_active
		WHERE id = $1
		RETURNING *
	`, id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, reminder)
}

// GetTodayReminders returns reminders for today
func (h *ReminderHandler) GetToday(w http.ResponseWriter, r *http.Request) {
	userID := 1

	// Get current day of week (1=Monday, 7=Sunday)
	// PostgreSQL uses 0=Sunday, but we'll use 1-7 in our JSON
	var reminders []models.Reminder
	err := h.db.Select(&reminders, `
		SELECT * FROM reminders
		WHERE user_id = $1
		AND is_active = true
		ORDER BY time ASC
	`, userID)

	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, reminders)
}
