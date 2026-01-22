package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"health-ai-portal/internal/database"
	"health-ai-portal/internal/models"

	"github.com/go-chi/chi/v5"
)

type GoalHandler struct {
	db *database.DB
}

func NewGoalHandler(db *database.DB) *GoalHandler {
	return &GoalHandler{db: db}
}

func (h *GoalHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := 1

	var goals []models.Goal
	err := h.db.Select(&goals, `
		SELECT * FROM goals WHERE user_id = $1
		ORDER BY
			CASE priority
				WHEN 'critical' THEN 1
				WHEN 'high' THEN 2
				WHEN 'medium' THEN 3
				WHEN 'background' THEN 4
				ELSE 5
			END, name
	`, userID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, goals)
}

func (h *GoalHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var goal models.Goal
	err = h.db.Get(&goal, `SELECT * FROM goals WHERE id = $1`, id)
	if err != nil {
		http.Error(w, "Goal not found", http.StatusNotFound)
		return
	}

	respondJSON(w, http.StatusOK, goal)
}

func (h *GoalHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := 1

	var input models.GoalCreate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if input.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	var goal models.Goal
	err := h.db.Get(&goal, `
		INSERT INTO goals (user_id, name, current_value, target_value, strategy, priority, status)
		VALUES ($1, $2, $3, $4, $5, $6, 'active')
		RETURNING *
	`, userID, input.Name, input.CurrentValue, input.TargetValue, input.Strategy, input.Priority)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusCreated, goal)
}

func (h *GoalHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var input models.GoalUpdate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var goal models.Goal
	err = h.db.Get(&goal, `
		UPDATE goals SET
			name = COALESCE($2, name),
			current_value = COALESCE($3, current_value),
			target_value = COALESCE($4, target_value),
			strategy = COALESCE($5, strategy),
			priority = COALESCE($6, priority),
			status = COALESCE($7, status),
			updated_at = NOW()
		WHERE id = $1
		RETURNING *
	`, id, input.Name, input.CurrentValue, input.TargetValue, input.Strategy, input.Priority, input.Status)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, goal)
}

func (h *GoalHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	_, err = h.db.Exec(`DELETE FROM goals WHERE id = $1`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
