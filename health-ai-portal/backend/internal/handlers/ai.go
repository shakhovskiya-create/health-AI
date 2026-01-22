package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"health-ai-portal/internal/ai"
	"health-ai-portal/internal/database"
	"health-ai-portal/internal/models"

	"github.com/go-chi/chi/v5"
)

type AIHandler struct {
	db     *database.DB
	claude *ai.ClaudeClient
}

func NewAIHandler(db *database.DB, claude *ai.ClaudeClient) *AIHandler {
	return &AIHandler{db: db, claude: claude}
}

type AnalyzeRequest struct {
	CycleID   int    `json:"cycle_id"`
	Role      string `json:"role"`       // master_curator, red_team, meta_supervisor, or "full" for all
	InputData string `json:"input_data"` // If no cycle_id, use raw input
}

type AnalyzeResponse struct {
	CycleID   int                            `json:"cycle_id,omitempty"`
	Results   map[string]*ai.AnalysisResponse `json:"results"`
	CreatedAt time.Time                      `json:"created_at"`
}

// Analyze runs AI analysis for a cycle
func (h *AIHandler) Analyze(w http.ResponseWriter, r *http.Request) {
	var req AnalyzeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Get input data either from request or from existing cycle
	inputData := req.InputData
	if req.CycleID > 0 && inputData == "" {
		cycle, err := h.getCycle(req.CycleID)
		if err != nil {
			respondError(w, http.StatusNotFound, "Cycle not found")
			return
		}
		inputData = string(cycle.InputData)
	}

	if inputData == "" {
		respondError(w, http.StatusBadRequest, "Input data is required")
		return
	}

	ctx := r.Context()
	results := make(map[string]*ai.AnalysisResponse)

	if req.Role == "full" || req.Role == "" {
		// Run full cycle (all 3 roles)
		fullResults, err := h.claude.RunFullCycle(ctx, inputData)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "AI analysis failed: "+err.Error())
			return
		}
		results = fullResults
	} else {
		// Run single role
		result, err := h.claude.Analyze(ctx, ai.AnalysisRequest{
			Role:      req.Role,
			InputData: inputData,
		})
		if err != nil {
			respondError(w, http.StatusInternalServerError, "AI analysis failed: "+err.Error())
			return
		}
		results[req.Role] = result
	}

	// If we have a cycle_id, save results to DB
	if req.CycleID > 0 {
		if err := h.saveAnalysisResults(req.CycleID, results); err != nil {
			// Log error but don't fail - results are still valid
		}
	}

	respondJSON(w, http.StatusOK, AnalyzeResponse{
		CycleID:   req.CycleID,
		Results:   results,
		CreatedAt: time.Now(),
	})
}

// GetAnalysis returns saved analysis for a cycle
func (h *AIHandler) GetAnalysis(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "cycleId"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid cycle ID")
		return
	}

	cycle, err := h.getCycle(id)
	if err != nil {
		respondError(w, http.StatusNotFound, "Cycle not found")
		return
	}

	results := make(map[string]*ai.AnalysisResponse)

	if cycle.MasterCuratorOutput != nil {
		results["master_curator"] = &ai.AnalysisResponse{
			Role:    "master_curator",
			Content: *cycle.MasterCuratorOutput,
		}
	}
	if cycle.RedTeamOutput != nil {
		results["red_team"] = &ai.AnalysisResponse{
			Role:    "red_team",
			Content: *cycle.RedTeamOutput,
		}
	}
	if cycle.MetaSupervisorOutput != nil {
		results["meta_supervisor"] = &ai.AnalysisResponse{
			Role:    "meta_supervisor",
			Content: *cycle.MetaSupervisorOutput,
		}
	}

	respondJSON(w, http.StatusOK, AnalyzeResponse{
		CycleID:   id,
		Results:   results,
		CreatedAt: cycle.CreatedAt,
	})
}

func (h *AIHandler) getCycle(id int) (*models.Cycle, error) {
	var cycle models.Cycle
	err := h.db.DB.Get(&cycle, "SELECT * FROM cycles WHERE id = $1", id)
	return &cycle, err
}

func (h *AIHandler) saveAnalysisResults(cycleID int, results map[string]*ai.AnalysisResponse) error {
	var masterOutput, redTeamOutput, metaOutput *string

	if r, ok := results["master_curator"]; ok {
		masterOutput = &r.Content
	}
	if r, ok := results["red_team"]; ok {
		redTeamOutput = &r.Content
	}
	if r, ok := results["meta_supervisor"]; ok {
		metaOutput = &r.Content
	}

	_, err := h.db.DB.Exec(`
		UPDATE cycles SET
			master_curator_output = $1,
			red_team_output = $2,
			meta_supervisor_output = $3,
			updated_at = NOW()
		WHERE id = $4
	`, masterOutput, redTeamOutput, metaOutput, cycleID)

	return err
}
