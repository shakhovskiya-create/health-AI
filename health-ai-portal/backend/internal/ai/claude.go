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
	case "master_curator":
		systemPrompt = MasterCuratorPrompt
	case "red_team":
		systemPrompt = RedTeamPrompt
	case "meta_supervisor":
		systemPrompt = MetaSupervisorPrompt
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

// RunFullCycle runs all three roles in sequence
func (c *ClaudeClient) RunFullCycle(ctx context.Context, inputData string) (map[string]*AnalysisResponse, error) {
	results := make(map[string]*AnalysisResponse)

	// 1. Master Curator
	curatorResp, err := c.Analyze(ctx, AnalysisRequest{
		Role:      "master_curator",
		InputData: inputData,
	})
	if err != nil {
		return nil, fmt.Errorf("master curator failed: %w", err)
	}
	results["master_curator"] = curatorResp

	// 2. Red Team (with curator output as context)
	redTeamContext := fmt.Sprintf("### ВЫВОДЫ MASTER CURATOR:\n\n%s", curatorResp.Content)
	redTeamResp, err := c.Analyze(ctx, AnalysisRequest{
		Role:      "red_team",
		InputData: inputData,
		Context:   redTeamContext,
	})
	if err != nil {
		return nil, fmt.Errorf("red team failed: %w", err)
	}
	results["red_team"] = redTeamResp

	// 3. Meta-Supervisor (with both outputs as context)
	metaContext := fmt.Sprintf(
		"### ВЫВОДЫ MASTER CURATOR:\n\n%s\n\n---\n\n### ВЫВОДЫ RED TEAM:\n\n%s",
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
