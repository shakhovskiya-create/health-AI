package models

import (
	"encoding/json"
	"time"
)

type Reminder struct {
	ID           int             `db:"id" json:"id"`
	UserID       int             `db:"user_id" json:"user_id"`
	ReminderType *string         `db:"reminder_type" json:"reminder_type"`
	Title        string          `db:"title" json:"title"`
	Description  *string         `db:"description" json:"description"`
	Time         *string         `db:"time" json:"time"`
	DaysOfWeek   json.RawMessage `db:"days_of_week" json:"days_of_week"`
	IsActive     bool            `db:"is_active" json:"is_active"`
	CreatedAt    time.Time       `db:"created_at" json:"created_at"`
}

type ReminderCreate struct {
	ReminderType *string `json:"reminder_type"`
	Title        string  `json:"title" validate:"required"`
	Description  *string `json:"description"`
	Time         *string `json:"time"`
	DaysOfWeek   []int   `json:"days_of_week"`
	IsActive     *bool   `json:"is_active"`
}

type ReminderUpdate struct {
	ReminderType *string `json:"reminder_type"`
	Title        *string `json:"title"`
	Description  *string `json:"description"`
	Time         *string `json:"time"`
	DaysOfWeek   []int   `json:"days_of_week"`
	IsActive     *bool   `json:"is_active"`
}
