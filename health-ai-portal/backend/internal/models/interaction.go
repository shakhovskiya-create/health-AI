package models

import (
	"time"
)

type Interaction struct {
	ID              int       `db:"id" json:"id"`
	Supplement1ID   int       `db:"supplement_1_id" json:"supplement_1_id"`
	Supplement2ID   int       `db:"supplement_2_id" json:"supplement_2_id"`
	InteractionType *string   `db:"interaction_type" json:"interaction_type"`
	Description     *string   `db:"description" json:"description"`
	Solution        *string   `db:"solution" json:"solution"`
	CreatedAt       time.Time `db:"created_at" json:"created_at"`
}

type InteractionWithNames struct {
	Interaction
	Supplement1Name string `db:"supplement_1_name" json:"supplement_1_name"`
	Supplement2Name string `db:"supplement_2_name" json:"supplement_2_name"`
}

type InteractionCreate struct {
	Supplement1ID   int     `json:"supplement_1_id" validate:"required"`
	Supplement2ID   int     `json:"supplement_2_id" validate:"required"`
	InteractionType *string `json:"interaction_type"`
	Description     *string `json:"description"`
	Solution        *string `json:"solution"`
}

type InteractionUpdate struct {
	InteractionType *string `json:"interaction_type"`
	Description     *string `json:"description"`
	Solution        *string `json:"solution"`
}
