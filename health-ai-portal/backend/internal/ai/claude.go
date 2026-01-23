package ai

import (
	"context"
	"fmt"

	"github.com/liushuangls/go-anthropic/v2"
)

type ClaudeClient struct {
	client *anthropic.Client
	model  string
}

func NewClaudeClient(apiKey string) *ClaudeClient {
	client := anthropic.NewClient(apiKey)
	return &ClaudeClient{
		client: client,
		model:  "claude-sonnet-4-20250514",
	}
}

type AnalysisRequest struct {
	Role      string `json:"role"`
	InputData string `json:"input_data"`
	Context   string `json:"context"` // Previous role outputs for chain
}

type AnalysisResponse struct {
	Role     string `json:"role"`
	Content  string `json:"content"`
	Model    string `json:"model"`
	Tokens   int    `json:"tokens"`
}

func (c *ClaudeClient) Analyze(ctx context.Context, req AnalysisRequest) (*AnalysisResponse, error) {
	prompt := c.buildPrompt(req)

	resp, err := c.client.CreateMessages(ctx, anthropic.MessagesRequest{
		Model:     c.model,
		MaxTokens: 8192,
		Messages: []anthropic.Message{
			{
				Role:    anthropic.RoleUser,
				Content: []anthropic.MessageContent{
					anthropic.NewTextMessageContent(prompt),
				},
			},
		},
	})

	if err != nil {
		return nil, fmt.Errorf("claude API error: %w", err)
	}

	var content string
	for _, block := range resp.Content {
		if block.Type == "text" {
			content += block.GetText()
		}
	}

	return &AnalysisResponse{
		Role:    req.Role,
		Content: content,
		Model:   string(c.model),
		Tokens:  resp.Usage.InputTokens + resp.Usage.OutputTokens,
	}, nil
}

func (c *ClaudeClient) buildPrompt(req AnalysisRequest) string {
	var systemPrompt string

	switch req.Role {
	case "research_strategy_lead":
		systemPrompt = ResearchStrategyLeadPrompt
	case "master_curator":
		systemPrompt = MasterCuratorPrompt
	case "red_team":
		systemPrompt = RedTeamPrompt
	case "meta_supervisor":
		systemPrompt = MetaSupervisorPrompt
	case "lab_parser":
		systemPrompt = LabParserPrompt
	default:
		systemPrompt = MasterCuratorPrompt
	}

	prompt := systemPrompt + "\n\n---\n\n"

	if req.Context != "" {
		prompt += "## КОНТЕКСТ ПРЕДЫДУЩИХ АНАЛИЗОВ\n\n" + req.Context + "\n\n---\n\n"
	}

	prompt += "## ВХОДНЫЕ ДАННЫЕ ТЕКУЩЕГО ЦИКЛА\n\n" + req.InputData

	return prompt
}

// RunFullCycle runs all four roles in sequence: RSL → Curator → Red Team → Meta-Supervisor
func (c *ClaudeClient) RunFullCycle(ctx context.Context, inputData string) (map[string]*AnalysisResponse, error) {
	results := make(map[string]*AnalysisResponse)

	// 1. Research & Strategy Lead (RSL) - first, no context
	rslResp, err := c.Analyze(ctx, AnalysisRequest{
		Role:      "research_strategy_lead",
		InputData: inputData,
	})
	if err != nil {
		return nil, fmt.Errorf("research strategy lead failed: %w", err)
	}
	results["research_strategy_lead"] = rslResp

	// 2. Master Curator (with RSL output as context)
	curatorContext := fmt.Sprintf("### RESEARCH & STRATEGY REPORT:\n\n%s", rslResp.Content)
	curatorResp, err := c.Analyze(ctx, AnalysisRequest{
		Role:      "master_curator",
		InputData: inputData,
		Context:   curatorContext,
	})
	if err != nil {
		return nil, fmt.Errorf("master curator failed: %w", err)
	}
	results["master_curator"] = curatorResp

	// 3. Red Team (with RSL + Curator outputs as context)
	redTeamContext := fmt.Sprintf(
		"### RESEARCH & STRATEGY REPORT:\n\n%s\n\n---\n\n### ВЫВОДЫ MASTER CURATOR:\n\n%s",
		rslResp.Content,
		curatorResp.Content,
	)
	redTeamResp, err := c.Analyze(ctx, AnalysisRequest{
		Role:      "red_team",
		InputData: inputData,
		Context:   redTeamContext,
	})
	if err != nil {
		return nil, fmt.Errorf("red team failed: %w", err)
	}
	results["red_team"] = redTeamResp

	// 4. Meta-Supervisor (with all outputs as context)
	metaContext := fmt.Sprintf(
		"### RESEARCH & STRATEGY REPORT:\n\n%s\n\n---\n\n### ВЫВОДЫ MASTER CURATOR:\n\n%s\n\n---\n\n### ВЫВОДЫ RED TEAM:\n\n%s",
		rslResp.Content,
		curatorResp.Content,
		redTeamResp.Content,
	)
	metaResp, err := c.Analyze(ctx, AnalysisRequest{
		Role:      "meta_supervisor",
		InputData: inputData,
		Context:   metaContext,
	})
	if err != nil {
		return nil, fmt.Errorf("meta supervisor failed: %w", err)
	}
	results["meta_supervisor"] = metaResp

	return results, nil
}
