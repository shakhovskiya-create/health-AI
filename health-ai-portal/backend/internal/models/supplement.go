package models

import (
	"time"
)

type Supplement struct {
	ID            int        `db:"id" json:"id"`
	UserID        int        `db:"user_id" json:"user_id"`
	Name          string     `db:"name" json:"name"`
	Dose          *string    `db:"dose" json:"dose"`
	TimeOfDay     *string    `db:"time_of_day" json:"time_of_day"`
	Category      *string    `db:"category" json:"category"`
	Mechanism     *string    `db:"mechanism" json:"mechanism"`
	Target        *string    `db:"target" json:"target"`
	Status        string     `db:"status" json:"status"`
	EvidenceLevel *string    `db:"evidence_level" json:"evidence_level"`
	Notes         *string    `db:"notes" json:"notes"`
	CreatedAt     time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time  `db:"updated_at" json:"updated_at"`
	RemovedAt     *time.Time `db:"removed_at" json:"removed_at,omitempty"`
}

type SupplementCreate struct {
	Name          string  `json:"name" validate:"required"`
	Dose          *string `json:"dose"`
	TimeOfDay     *string `json:"time_of_day"`
	Category      *string `json:"category"`
	Mechanism     *string `json:"mechanism"`
	Target        *string `json:"target"`
	EvidenceLevel *string `json:"evidence_level"`
	Notes         *string `json:"notes"`
}

type SupplementUpdate struct {
	Name          *string `json:"name"`
	Dose          *string `json:"dose"`
	TimeOfDay     *string `json:"time_of_day"`
	Category      *string `json:"category"`
	Mechanism     *string `json:"mechanism"`
	Target        *string `json:"target"`
	Status        *string `json:"status"`
	EvidenceLevel *string `json:"evidence_level"`
	Notes         *string `json:"notes"`
}

type SupplementFilter struct {
	Status   *string `json:"status"`
	Category *string `json:"category"`
}

type ScheduleItem struct {
	TimeOfDay   string       `json:"time_of_day"`
	Supplements []Supplement `json:"supplements"`
}
