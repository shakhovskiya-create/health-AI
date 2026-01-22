package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"health-ai-portal/internal/database"
	"health-ai-portal/internal/models"

	"github.com/go-chi/chi/v5"
)

type InteractionHandler struct {
	db *database.DB
}

func NewInteractionHandler(db *database.DB) *InteractionHandler {
	return &InteractionHandler{db: db}
}

func (h *InteractionHandler) List(w http.ResponseWriter, r *http.Request) {
	interactionType := r.URL.Query().Get("type")

	query := `
		SELECT i.*,
			s1.name as supplement_1_name,
			s2.name as supplement_2_name
		FROM interactions i
		JOIN supplements s1 ON i.supplement_1_id = s1.id
		JOIN supplements s2 ON i.supplement_2_id = s2.id
	`

	args := []interface{}{}
	if interactionType != "" {
		query += ` WHERE i.interaction_type = $1`
		args = append(args, interactionType)
	}

	query += ` ORDER BY
		CASE i.interaction_type
			WHEN 'critical' THEN 1
			WHEN 'warning' THEN 2
			WHEN 'synergy' THEN 3
			ELSE 4
		END,
		i.created_at DESC`

	var interactions []models.InteractionWithNames
	var err error
	if len(args) > 0 {
		err = h.db.Select(&interactions, query, args...)
	} else {
		err = h.db.Select(&interactions, query)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, interactions)
}

func (h *InteractionHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var interaction models.InteractionWithNames
	err = h.db.Get(&interaction, `
		SELECT i.*,
			s1.name as supplement_1_name,
			s2.name as supplement_2_name
		FROM interactions i
		JOIN supplements s1 ON i.supplement_1_id = s1.id
		JOIN supplements s2 ON i.supplement_2_id = s2.id
		WHERE i.id = $1
	`, id)

	if err != nil {
		http.Error(w, "Interaction not found", http.StatusNotFound)
		return
	}

	respondJSON(w, http.StatusOK, interaction)
}

func (h *InteractionHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input models.InteractionCreate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if input.Supplement1ID == 0 || input.Supplement2ID == 0 {
		http.Error(w, "Both supplement IDs are required", http.StatusBadRequest)
		return
	}

	if input.Supplement1ID == input.Supplement2ID {
		http.Error(w, "Cannot create interaction between same supplement", http.StatusBadRequest)
		return
	}

	var interaction models.Interaction
	err := h.db.Get(&interaction, `
		INSERT INTO interactions (supplement_1_id, supplement_2_id, interaction_type, description, solution)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING *
	`, input.Supplement1ID, input.Supplement2ID, input.InteractionType, input.Description, input.Solution)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Fetch with names
	var result models.InteractionWithNames
	h.db.Get(&result, `
		SELECT i.*,
			s1.name as supplement_1_name,
			s2.name as supplement_2_name
		FROM interactions i
		JOIN supplements s1 ON i.supplement_1_id = s1.id
		JOIN supplements s2 ON i.supplement_2_id = s2.id
		WHERE i.id = $1
	`, interaction.ID)

	respondJSON(w, http.StatusCreated, result)
}

func (h *InteractionHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var input models.InteractionUpdate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var interaction models.Interaction
	err = h.db.Get(&interaction, `
		UPDATE interactions SET
			interaction_type = COALESCE($2, interaction_type),
			description = COALESCE($3, description),
			solution = COALESCE($4, solution)
		WHERE id = $1
		RETURNING *
	`, id, input.InteractionType, input.Description, input.Solution)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Fetch with names
	var result models.InteractionWithNames
	h.db.Get(&result, `
		SELECT i.*,
			s1.name as supplement_1_name,
			s2.name as supplement_2_name
		FROM interactions i
		JOIN supplements s1 ON i.supplement_1_id = s1.id
		JOIN supplements s2 ON i.supplement_2_id = s2.id
		WHERE i.id = $1
	`, interaction.ID)

	respondJSON(w, http.StatusOK, result)
}

func (h *InteractionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	_, err = h.db.Exec(`DELETE FROM interactions WHERE id = $1`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
