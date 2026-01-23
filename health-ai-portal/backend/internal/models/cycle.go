package models

import (
	"encoding/json"
	"time"
)

type Cycle struct {
	ID                   int              `db:"id" json:"id"`
	UserID               int              `db:"user_id" json:"user_id"`
	CycleDate            time.Time        `db:"cycle_date" json:"cycle_date"`
	CycleType            *string          `db:"cycle_type" json:"cycle_type"`
	Verdict              *string          `db:"verdict" json:"verdict"`
	InputData            *json.RawMessage `db:"input_data" json:"input_data"`
	RSLOutput            *string          `db:"rsl_output" json:"rsl_output"`
	MasterCuratorOutput  *string          `db:"master_curator_output" json:"master_curator_output"`
	RedTeamOutput        *string          `db:"red_team_output" json:"red_team_output"`
	MetaSupervisorOutput *string          `db:"meta_supervisor_output" json:"meta_supervisor_output"`
	Decisions            *json.RawMessage `db:"decisions" json:"decisions"`
	RequiredLabs         *json.RawMessage `db:"required_labs" json:"required_labs"`
	NextReviewDate       *time.Time       `db:"next_review_date" json:"next_review_date"`
	CreatedAt            time.Time        `db:"created_at" json:"created_at"`
	UpdatedAt            time.Time        `db:"updated_at" json:"updated_at"`
}

type CycleCreate struct {
	CycleDate      time.Time       `json:"cycle_date" validate:"required"`
	CycleType      *string         `json:"cycle_type"`
	InputData      json.RawMessage `json:"input_data"`
	NextReviewDate *time.Time      `json:"next_review_date"`
}

type CycleUpdate struct {
	Verdict              *string         `json:"verdict"`
	RSLOutput            *string         `json:"rsl_output"`
	MasterCuratorOutput  *string         `json:"master_curator_output"`
	RedTeamOutput        *string         `json:"red_team_output"`
	MetaSupervisorOutput *string         `json:"meta_supervisor_output"`
	Decisions            json.RawMessage `json:"decisions"`
	RequiredLabs         json.RawMessage `json:"required_labs"`
	NextReviewDate       *time.Time      `json:"next_review_date"`
}

type CycleInputData struct {
	Goals       string `json:"goals"`
	Wellbeing   struct {
		Sleep            string `json:"sleep"`
		Energy           string `json:"energy"`
		CognitiveClarity string `json:"cognitive_clarity"`
		Libido           string `json:"libido"`
		Skin             string `json:"skin"`
		GI               string `json:"gi"`
		BloodPressure    string `json:"blood_pressure"`
		Other            string `json:"other"`
	} `json:"wellbeing"`
	Training struct {
		Frequency  string `json:"frequency"`
		Split      string `json:"split"`
		Exercises  string `json:"exercises"`
		Steps      int    `json:"steps"`
		Cardio     string `json:"cardio"`
	} `json:"training"`
	Nutrition struct {
		Calories int    `json:"calories"`
		Protein  int    `json:"protein"`
		Carbs    int    `json:"carbs"`
		Fats     int    `json:"fats"`
		IF       bool   `json:"if"`
		Caffeine bool   `json:"caffeine"`
		Alcohol  bool   `json:"alcohol"`
	} `json:"nutrition"`
	Metrics struct {
		Weight        float64 `json:"weight"`
		BloodPressure string  `json:"blood_pressure"`
		Pulse         int     `json:"pulse"`
		HRV           int     `json:"hrv"`
		Glucose       float64 `json:"glucose"`
	} `json:"metrics"`
	Changes   string `json:"changes"`
	AIRequest string `json:"ai_request"`
}
