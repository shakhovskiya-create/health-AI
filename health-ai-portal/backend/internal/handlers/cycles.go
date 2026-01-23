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

type CycleHandler struct {
	db *database.DB
}

func NewCycleHandler(db *database.DB) *CycleHandler {
	return &CycleHandler{db: db}
}

func (h *CycleHandler) List(w http.ResponseWriter, r *http.Request) {
	cycles := []models.Cycle{}
	err := h.db.Select(&cycles, `
		SELECT * FROM cycles
		ORDER BY cycle_date DESC
		LIMIT 50
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch cycles: "+err.Error())
		return
	}
	respondJSON(w, http.StatusOK, cycles)
}

func (h *CycleHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid ID")
		return
	}

	var cycle models.Cycle
	err = h.db.DB.Get(&cycle, "SELECT * FROM cycles WHERE id = $1", id)
	if err != nil {
		respondError(w, http.StatusNotFound, "Cycle not found")
		return
	}
	respondJSON(w, http.StatusOK, cycle)
}

func (h *CycleHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input models.CycleCreate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Set default date if not provided
	if input.CycleDate.IsZero() {
		input.CycleDate = time.Now()
	}

	var cycle models.Cycle
	err := h.db.DB.QueryRowx(`
		INSERT INTO cycles (user_id, cycle_date, cycle_type, input_data, next_review_date)
		VALUES (1, $1, $2, $3, $4)
		RETURNING *
	`, input.CycleDate, input.CycleType, input.InputData, input.NextReviewDate).StructScan(&cycle)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create cycle: "+err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, cycle)
}

func (h *CycleHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid ID")
		return
	}

	var input models.CycleUpdate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var cycle models.Cycle
	err = h.db.DB.QueryRowx(`
		UPDATE cycles SET
			verdict = COALESCE($1, verdict),
			master_curator_output = COALESCE($2, master_curator_output),
			red_team_output = COALESCE($3, red_team_output),
			meta_supervisor_output = COALESCE($4, meta_supervisor_output),
			decisions = COALESCE($5, decisions),
			required_labs = COALESCE($6, required_labs),
			next_review_date = COALESCE($7, next_review_date),
			updated_at = NOW()
		WHERE id = $8
		RETURNING *
	`, input.Verdict, input.MasterCuratorOutput, input.RedTeamOutput,
		input.MetaSupervisorOutput, input.Decisions, input.RequiredLabs,
		input.NextReviewDate, id).StructScan(&cycle)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update cycle: "+err.Error())
		return
	}
	respondJSON(w, http.StatusOK, cycle)
}

func (h *CycleHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid ID")
		return
	}

	result, err := h.db.DB.Exec("DELETE FROM cycles WHERE id = $1", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete cycle")
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		respondError(w, http.StatusNotFound, "Cycle not found")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "Cycle deleted"})
}

// GetLatest returns the most recent cycle
func (h *CycleHandler) GetLatest(w http.ResponseWriter, r *http.Request) {
	var cycle models.Cycle
	err := h.db.DB.Get(&cycle, `
		SELECT * FROM cycles
		ORDER BY cycle_date DESC
		LIMIT 1
	`)
	if err != nil {
		// Return empty if no cycles exist
		respondJSON(w, http.StatusOK, nil)
		return
	}
	respondJSON(w, http.StatusOK, cycle)
}
