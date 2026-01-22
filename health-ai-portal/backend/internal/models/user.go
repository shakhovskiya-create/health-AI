package models

import (
	"time"
)

type User struct {
	ID         int        `db:"id" json:"id"`
	Name       string     `db:"name" json:"name"`
	PinHash    *string    `db:"pin_hash" json:"-"`
	BirthDate  *time.Time `db:"birth_date" json:"birth_date"`
	HeightCm   *int       `db:"height_cm" json:"height_cm"`
	WeightKg   *float64   `db:"weight_kg" json:"weight_kg"`
	BodyFatPct *float64   `db:"body_fat_pct" json:"body_fat_pct"`
	CreatedAt  time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt  time.Time  `db:"updated_at" json:"updated_at"`
}

type UserUpdate struct {
	Name       *string    `json:"name"`
	BirthDate  *time.Time `json:"birth_date"`
	HeightCm   *int       `json:"height_cm"`
	WeightKg   *float64   `json:"weight_kg"`
	BodyFatPct *float64   `json:"body_fat_pct"`
}
