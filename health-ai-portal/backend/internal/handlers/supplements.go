package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"health-ai-portal/internal/database"
	"health-ai-portal/internal/models"

	"github.com/go-chi/chi/v5"
)

type SupplementHandler struct {
	db *database.DB
}

func NewSupplementHandler(db *database.DB) *SupplementHandler {
	return &SupplementHandler{db: db}
}

func (h *SupplementHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := 1 // TODO: get from auth context

	status := r.URL.Query().Get("status")
	category := r.URL.Query().Get("category")

	query := `SELECT * FROM supplements WHERE user_id = $1`
	args := []interface{}{userID}
	argCount := 1

	if status != "" {
		argCount++
		query += ` AND status = $` + strconv.Itoa(argCount)
		args = append(args, status)
	}
	if category != "" {
		argCount++
		query += ` AND category = $` + strconv.Itoa(argCount)
		args = append(args, category)
	}

	query += ` ORDER BY time_of_day, name`

	var supplements []models.Supplement
	err := h.db.Select(&supplements, query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, supplements)
}

func (h *SupplementHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var supplement models.Supplement
	err = h.db.Get(&supplement, `SELECT * FROM supplements WHERE id = $1`, id)
	if err != nil {
		http.Error(w, "Supplement not found", http.StatusNotFound)
		return
	}

	respondJSON(w, http.StatusOK, supplement)
}

func (h *SupplementHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := 1 // TODO: get from auth context

	var input models.SupplementCreate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if input.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	var supplement models.Supplement
	err := h.db.Get(&supplement, `
		INSERT INTO supplements (user_id, name, dose, time_of_day, category, mechanism, target, evidence_level, notes, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
		RETURNING *
	`, userID, input.Name, input.Dose, input.TimeOfDay, input.Category, input.Mechanism, input.Target, input.EvidenceLevel, input.Notes)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusCreated, supplement)
}

func (h *SupplementHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var input models.SupplementUpdate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var supplement models.Supplement
	err = h.db.Get(&supplement, `
		UPDATE supplements SET
			name = COALESCE($2, name),
			dose = COALESCE($3, dose),
			time_of_day = COALESCE($4, time_of_day),
			category = COALESCE($5, category),
			mechanism = COALESCE($6, mechanism),
			target = COALESCE($7, target),
			status = COALESCE($8, status),
			evidence_level = COALESCE($9, evidence_level),
			notes = COALESCE($10, notes),
			updated_at = NOW()
		WHERE id = $1
		RETURNING *
	`, id, input.Name, input.Dose, input.TimeOfDay, input.Category, input.Mechanism, input.Target, input.Status, input.EvidenceLevel, input.Notes)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, supplement)
}

func (h *SupplementHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	// Soft delete
	now := time.Now()
	_, err = h.db.Exec(`
		UPDATE supplements SET status = 'removed', removed_at = $2, updated_at = NOW()
		WHERE id = $1
	`, id, now)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *SupplementHandler) GetSchedule(w http.ResponseWriter, r *http.Request) {
	userID := 1 // TODO: get from auth context

	var supplements []models.Supplement
	err := h.db.Select(&supplements, `
		SELECT * FROM supplements
		WHERE user_id = $1 AND status = 'active' AND time_of_day IS NOT NULL
		ORDER BY time_of_day, name
	`, userID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Group by time_of_day
	scheduleMap := make(map[string][]models.Supplement)
	for _, s := range supplements {
		if s.TimeOfDay != nil {
			scheduleMap[*s.TimeOfDay] = append(scheduleMap[*s.TimeOfDay], s)
		}
	}

	var schedule []models.ScheduleItem
	for time, supps := range scheduleMap {
		schedule = append(schedule, models.ScheduleItem{
			TimeOfDay:   time,
			Supplements: supps,
		})
	}

	respondJSON(w, http.StatusOK, schedule)
}

func (h *SupplementHandler) GetByCategory(w http.ResponseWriter, r *http.Request) {
	userID := 1 // TODO: get from auth context

	var supplements []models.Supplement
	err := h.db.Select(&supplements, `
		SELECT * FROM supplements
		WHERE user_id = $1 AND status = 'active'
		ORDER BY category, time_of_day, name
	`, userID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Group by category
	categoryMap := make(map[string][]models.Supplement)
	for _, s := range supplements {
		cat := "uncategorized"
		if s.Category != nil {
			cat = *s.Category
		}
		categoryMap[cat] = append(categoryMap[cat], s)
	}

	respondJSON(w, http.StatusOK, categoryMap)
}
