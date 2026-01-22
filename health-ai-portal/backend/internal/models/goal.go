package models

import (
	"time"
)

type Goal struct {
	ID           int       `db:"id" json:"id"`
	UserID       int       `db:"user_id" json:"user_id"`
	Name         string    `db:"name" json:"name"`
	CurrentValue *string   `db:"current_value" json:"current_value"`
	TargetValue  *string   `db:"target_value" json:"target_value"`
	Strategy     *string   `db:"strategy" json:"strategy"`
	Priority     *string   `db:"priority" json:"priority"`
	Status       string    `db:"status" json:"status"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at" json:"updated_at"`
}

type GoalCreate struct {
	Name         string  `json:"name" validate:"required"`
	CurrentValue *string `json:"current_value"`
	TargetValue  *string `json:"target_value"`
	Strategy     *string `json:"strategy"`
	Priority     *string `json:"priority"`
}

type GoalUpdate struct {
	Name         *string `json:"name"`
	CurrentValue *string `json:"current_value"`
	TargetValue  *string `json:"target_value"`
	Strategy     *string `json:"strategy"`
	Priority     *string `json:"priority"`
	Status       *string `json:"status"`
}
