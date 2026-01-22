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

// ParseLabText parses lab results text using AI
type ParseLabRequest struct {
	Text     string `json:"text"`
	LabName  string `json:"lab_name"`
	TestDate string `json:"test_date"`
}

type ParsedMarker struct {
	MarkerName   string   `json:"marker_name"`
	Value        *float64 `json:"value"`
	Unit         string   `json:"unit"`
	ReferenceMin *float64 `json:"reference_min"`
	ReferenceMax *float64 `json:"reference_max"`
	Category     string   `json:"category"`
}

type ParseLabResponse struct {
	LabName  string         `json:"lab_name"`
	TestDate string         `json:"test_date"`
	Markers  []ParsedMarker `json:"markers"`
	RawText  string         `json:"raw_text,omitempty"`
}

func (h *AIHandler) ParseLabText(w http.ResponseWriter, r *http.Request) {
	var req ParseLabRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Text == "" {
		respondError(w, http.StatusBadRequest, "Text is required")
		return
	}

	ctx := r.Context()

	// Use Claude to parse the lab text
	prompt := `Ты парсер лабораторных анализов. Извлеки все показатели из текста ниже.

Верни ТОЛЬКО JSON массив без дополнительного текста. Формат каждого элемента:
{
  "marker_name": "название показателя (на английском, стандартное)",
  "value": числовое_значение или null,
  "unit": "единицы измерения",
  "reference_min": минимум_нормы или null,
  "reference_max": максимум_нормы или null,
  "category": "категория"
}

Категории: hormones, thyroid, lipids, liver, kidney, blood, inflammation, vitamins, minerals, metabolism, other

Стандартные названия маркеров (используй их):
- Testosterone Total, Testosterone Free, Estradiol, Prolactin, LH, FSH, SHBG, DHEA-S
- TSH, fT3, fT4
- Cortisol, ACTH, Insulin, Glucose, HbA1c
- Cholesterol Total, LDL, HDL, Triglycerides
- ALT, AST, GGT, Bilirubin Total
- Creatinine, Urea, Uric Acid
- Ferritin, Iron, Vitamin D, Vitamin B12, Folate
- Hemoglobin, Hematocrit, RBC, WBC, Platelets, ESR
- CRP, Homocysteine, IGF-1

ТЕКСТ ДЛЯ ПАРСИНГА:
` + req.Text

	result, err := h.claude.Analyze(ctx, ai.AnalysisRequest{
		Role:      "lab_parser",
		InputData: prompt,
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, "AI parsing failed: "+err.Error())
		return
	}

	// Parse Claude's response
	var markers []ParsedMarker
	content := result.Content

	// Try to extract JSON from response
	start := -1
	end := -1
	bracketCount := 0
	for i, c := range content {
		if c == '[' {
			if start == -1 {
				start = i
			}
			bracketCount++
		} else if c == ']' {
			bracketCount--
			if bracketCount == 0 && start != -1 {
				end = i + 1
				break
			}
		}
	}

	if start != -1 && end != -1 {
		jsonStr := content[start:end]
		if err := json.Unmarshal([]byte(jsonStr), &markers); err != nil {
			// Return raw response if parsing fails
			respondJSON(w, http.StatusOK, ParseLabResponse{
				LabName:  req.LabName,
				TestDate: req.TestDate,
				Markers:  []ParsedMarker{},
				RawText:  content,
			})
			return
		}
	}

	respondJSON(w, http.StatusOK, ParseLabResponse{
		LabName:  req.LabName,
		TestDate: req.TestDate,
		Markers:  markers,
	})
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
