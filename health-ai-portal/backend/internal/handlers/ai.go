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
		if cycle.InputData != nil {
			inputData = string(*cycle.InputData)
		}
	}

	if inputData == "" {
		respondError(w, http.StatusBadRequest, "Input data is required")
		return
	}

	ctx := r.Context()
	results := make(map[string]*ai.AnalysisResponse)

	if req.Role == "full" || req.Role == "" {
		// Run full cycle (all 4 roles: RSL → Curator → Red Team → Meta-Supervisor)
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

	if cycle.RSLOutput != nil {
		results["research_strategy_lead"] = &ai.AnalysisResponse{
			Role:    "research_strategy_lead",
			Content: *cycle.RSLOutput,
		}
	}
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

// ParsePDF handles PDF file upload and parsing
func (h *AIHandler) ParsePDF(w http.ResponseWriter, r *http.Request) {
	// Limit upload size to 10MB
	r.ParseMultipartForm(10 << 20)

	file, header, err := r.FormFile("file")
	if err != nil {
		respondError(w, http.StatusBadRequest, "Failed to read file: "+err.Error())
		return
	}
	defer file.Close()

	labName := r.FormValue("lab_name")
	testDate := r.FormValue("test_date")

	// Read file content
	fileBytes := make([]byte, header.Size)
	_, err = file.Read(fileBytes)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to read file content")
		return
	}

	// Extract text from PDF using simple text extraction
	// For PDFs, we'll try to extract embedded text
	text := extractTextFromPDF(fileBytes)

	if text == "" {
		respondError(w, http.StatusBadRequest, "Could not extract text from PDF. Try text input instead.")
		return
	}

	ctx := r.Context()

	// Use Claude to parse the extracted text
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
` + text

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
			respondJSON(w, http.StatusOK, ParseLabResponse{
				LabName:  labName,
				TestDate: testDate,
				Markers:  []ParsedMarker{},
				RawText:  content,
			})
			return
		}
	}

	respondJSON(w, http.StatusOK, ParseLabResponse{
		LabName:  labName,
		TestDate: testDate,
		Markers:  markers,
	})
}

// extractTextFromPDF extracts text content from PDF bytes
func extractTextFromPDF(data []byte) string {
	// Simple PDF text extraction - looks for text between BT and ET markers
	// and extracts strings in parentheses
	content := string(data)
	var result []byte

	// Look for text streams and extract readable text
	inText := false
	inString := false
	escape := false

	for i := 0; i < len(content); i++ {
		c := content[i]

		// Check for BT (begin text) and ET (end text)
		if i+1 < len(content) {
			if content[i:i+2] == "BT" {
				inText = true
				continue
			}
			if content[i:i+2] == "ET" {
				inText = false
				result = append(result, ' ')
				continue
			}
		}

		if inText {
			if c == '(' && !escape {
				inString = true
				continue
			}
			if c == ')' && !escape {
				inString = false
				result = append(result, ' ')
				continue
			}
			if c == '\\' && !escape {
				escape = true
				continue
			}
			if inString {
				// Handle common escape sequences
				if escape {
					switch c {
					case 'n':
						result = append(result, '\n')
					case 'r':
						result = append(result, '\r')
					case 't':
						result = append(result, '\t')
					default:
						result = append(result, c)
					}
					escape = false
				} else if c >= 32 && c < 127 {
					result = append(result, c)
				}
			}
		}
	}

	return string(result)
}

func (h *AIHandler) saveAnalysisResults(cycleID int, results map[string]*ai.AnalysisResponse) error {
	var rslOutput, masterOutput, redTeamOutput, metaOutput *string

	if r, ok := results["research_strategy_lead"]; ok {
		rslOutput = &r.Content
	}
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
			rsl_output = $1,
			master_curator_output = $2,
			red_team_output = $3,
			meta_supervisor_output = $4,
			updated_at = NOW()
		WHERE id = $5
	`, rslOutput, masterOutput, redTeamOutput, metaOutput, cycleID)

	return err
}
