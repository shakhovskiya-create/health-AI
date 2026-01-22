package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"health-ai-portal/internal/database"
	"health-ai-portal/internal/models"

	"github.com/go-chi/chi/v5"
)

type LabHandler struct {
	db *database.DB
}

func NewLabHandler(db *database.DB) *LabHandler {
	return &LabHandler{db: db}
}

func (h *LabHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := 1

	category := r.URL.Query().Get("category")

	query := `SELECT * FROM lab_results WHERE user_id = $1`
	args := []interface{}{userID}

	if category != "" {
		query += ` AND category = $2`
		args = append(args, category)
	}

	query += ` ORDER BY test_date DESC, marker_name`

	var results []models.LabResult
	err := h.db.Select(&results, query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, results)
}

func (h *LabHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var result models.LabResult
	err = h.db.Get(&result, `SELECT * FROM lab_results WHERE id = $1`, id)
	if err != nil {
		http.Error(w, "Lab result not found", http.StatusNotFound)
		return
	}

	respondJSON(w, http.StatusOK, result)
}

func (h *LabHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := 1

	var input models.LabResultCreate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if input.MarkerName == "" {
		http.Error(w, "Marker name is required", http.StatusBadRequest)
		return
	}

	var result models.LabResult
	err := h.db.Get(&result, `
		INSERT INTO lab_results (user_id, test_date, lab_name, marker_name, value, unit, reference_min, reference_max, category, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING *
	`, userID, input.TestDate, input.LabName, input.MarkerName, input.Value, input.Unit, input.ReferenceMin, input.ReferenceMax, input.Category, input.Notes)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusCreated, result)
}

func (h *LabHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var input models.LabResultUpdate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var result models.LabResult
	err = h.db.Get(&result, `
		UPDATE lab_results SET
			test_date = COALESCE($2, test_date),
			lab_name = COALESCE($3, lab_name),
			marker_name = COALESCE($4, marker_name),
			value = COALESCE($5, value),
			unit = COALESCE($6, unit),
			reference_min = COALESCE($7, reference_min),
			reference_max = COALESCE($8, reference_max),
			category = COALESCE($9, category),
			notes = COALESCE($10, notes)
		WHERE id = $1
		RETURNING *
	`, id, input.TestDate, input.LabName, input.MarkerName, input.Value, input.Unit, input.ReferenceMin, input.ReferenceMax, input.Category, input.Notes)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, result)
}

func (h *LabHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	_, err = h.db.Exec(`DELETE FROM lab_results WHERE id = $1`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *LabHandler) GetByMarker(w http.ResponseWriter, r *http.Request) {
	userID := 1
	markerName := chi.URLParam(r, "name")

	var results []models.LabResult
	err := h.db.Select(&results, `
		SELECT * FROM lab_results
		WHERE user_id = $1 AND marker_name = $2
		ORDER BY test_date DESC
	`, userID, markerName)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, results)
}

func (h *LabHandler) GetTrends(w http.ResponseWriter, r *http.Request) {
	userID := 1

	// Get unique markers with their history
	rows, err := h.db.Query(`
		SELECT DISTINCT marker_name FROM lab_results WHERE user_id = $1
	`, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var trends []models.LabTrend
	for rows.Next() {
		var markerName string
		if err := rows.Scan(&markerName); err != nil {
			continue
		}

		var results []models.LabResult
		h.db.Select(&results, `
			SELECT * FROM lab_results
			WHERE user_id = $1 AND marker_name = $2 AND value IS NOT NULL
			ORDER BY test_date ASC
		`, userID, markerName)

		if len(results) == 0 {
			continue
		}

		trend := models.LabTrend{
			MarkerName: markerName,
		}

		if results[0].Unit != nil {
			trend.Unit = *results[0].Unit
		}

		for _, r := range results {
			if r.Value != nil {
				trend.DataPoints = append(trend.DataPoints, models.LabTrendPoint{
					Date:  r.TestDate,
					Value: *r.Value,
				})
			}
		}

		trends = append(trends, trend)
	}

	respondJSON(w, http.StatusOK, trends)
}
