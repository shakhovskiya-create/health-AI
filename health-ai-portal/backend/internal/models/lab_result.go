package models

import (
	"time"
)

type LabResult struct {
	ID           int        `db:"id" json:"id"`
	UserID       int        `db:"user_id" json:"user_id"`
	TestDate     time.Time  `db:"test_date" json:"test_date"`
	LabName      *string    `db:"lab_name" json:"lab_name"`
	MarkerName   string     `db:"marker_name" json:"marker_name"`
	Value        *float64   `db:"value" json:"value"`
	Unit         *string    `db:"unit" json:"unit"`
	ReferenceMin *float64   `db:"reference_min" json:"reference_min"`
	ReferenceMax *float64   `db:"reference_max" json:"reference_max"`
	Category     *string    `db:"category" json:"category"`
	Notes        *string    `db:"notes" json:"notes"`
	CreatedAt    time.Time  `db:"created_at" json:"created_at"`
}

type LabResultCreate struct {
	TestDate     time.Time `json:"test_date" validate:"required"`
	LabName      *string   `json:"lab_name"`
	MarkerName   string    `json:"marker_name" validate:"required"`
	Value        *float64  `json:"value"`
	Unit         *string   `json:"unit"`
	ReferenceMin *float64  `json:"reference_min"`
	ReferenceMax *float64  `json:"reference_max"`
	Category     *string   `json:"category"`
	Notes        *string   `json:"notes"`
}

type LabResultUpdate struct {
	TestDate     *time.Time `json:"test_date"`
	LabName      *string    `json:"lab_name"`
	MarkerName   *string    `json:"marker_name"`
	Value        *float64   `json:"value"`
	Unit         *string    `json:"unit"`
	ReferenceMin *float64   `json:"reference_min"`
	ReferenceMax *float64   `json:"reference_max"`
	Category     *string    `json:"category"`
	Notes        *string    `json:"notes"`
}

type LabTrend struct {
	MarkerName string           `json:"marker_name"`
	Unit       string           `json:"unit"`
	DataPoints []LabTrendPoint  `json:"data_points"`
}

type LabTrendPoint struct {
	Date  time.Time `json:"date"`
	Value float64   `json:"value"`
}

type LabMarkerSummary struct {
	MarkerName   string    `json:"marker_name"`
	LatestValue  *float64  `json:"latest_value"`
	LatestDate   time.Time `json:"latest_date"`
	Unit         *string   `json:"unit"`
	ReferenceMin *float64  `json:"reference_min"`
	ReferenceMax *float64  `json:"reference_max"`
	Status       string    `json:"status"` // "normal", "low", "high"
}
