package pdf

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// LabMarker represents a single lab test result extracted from PDF
type LabMarker struct {
	MarkerName   string   `json:"marker_name"`
	Value        *float64 `json:"value"`
	Unit         string   `json:"unit"`
	ReferenceMin *float64 `json:"reference_min"`
	ReferenceMax *float64 `json:"reference_max"`
	Category     string   `json:"category"`
}

// ParsedLabResult represents the complete parsed result from a lab PDF
type ParsedLabResult struct {
	LabName  string      `json:"lab_name"`
	TestDate time.Time   `json:"test_date"`
	Markers  []LabMarker `json:"markers"`
}

// Common marker name mappings (Russian to normalized)
var markerMappings = map[string]string{
	"тестостерон общий":        "Testosterone Total",
	"тестостерон свободный":    "Testosterone Free",
	"эстрадиол":                "Estradiol",
	"пролактин":                "Prolactin",
	"ттг":                      "TSH",
	"т3 свободный":             "fT3",
	"т4 свободный":             "fT4",
	"лг":                       "LH",
	"фсг":                      "FSH",
	"dhea-s":                   "DHEA-S",
	"дгэа-с":                   "DHEA-S",
	"кортизол":                 "Cortisol",
	"актг":                     "ACTH",
	"инсулин":                  "Insulin",
	"глюкоза":                  "Glucose",
	"гликированный гемоглобин": "HbA1c",
	"hba1c":                    "HbA1c",
	"холестерин общий":         "Cholesterol Total",
	"лпнп":                     "LDL",
	"лпвп":                     "HDL",
	"триглицериды":             "Triglycerides",
	"алт":                      "ALT",
	"аст":                      "AST",
	"ггт":                      "GGT",
	"билирубин общий":          "Bilirubin Total",
	"креатинин":                "Creatinine",
	"мочевина":                 "Urea",
	"мочевая кислота":          "Uric Acid",
	"ферритин":                 "Ferritin",
	"железо":                   "Iron",
	"витамин d":                "Vitamin D",
	"витамин b12":              "Vitamin B12",
	"фолиевая кислота":         "Folate",
	"гемоглобин":               "Hemoglobin",
	"гематокрит":               "Hematocrit",
	"эритроциты":               "RBC",
	"лейкоциты":                "WBC",
	"тромбоциты":               "Platelets",
	"соэ":                      "ESR",
	"срб":                      "CRP",
	"c-реактивный белок":       "CRP",
	"igf-1":                    "IGF-1",
	"shbg":                     "SHBG",
	"гспг":                     "SHBG",
	"лептин":                   "Leptin",
	"гомоцистеин":              "Homocysteine",
	"psa":                      "PSA",
	"пса":                      "PSA",
}

// Category mappings
var categoryMappings = map[string]string{
	"Testosterone Total": "hormones",
	"Testosterone Free":  "hormones",
	"Estradiol":          "hormones",
	"Prolactin":          "hormones",
	"TSH":                "thyroid",
	"fT3":                "thyroid",
	"fT4":                "thyroid",
	"LH":                 "hormones",
	"FSH":                "hormones",
	"DHEA-S":             "hormones",
	"Cortisol":           "hormones",
	"ACTH":               "hormones",
	"Insulin":            "metabolism",
	"Glucose":            "metabolism",
	"HbA1c":              "metabolism",
	"Cholesterol Total":  "lipids",
	"LDL":                "lipids",
	"HDL":                "lipids",
	"Triglycerides":      "lipids",
	"ALT":                "liver",
	"AST":                "liver",
	"GGT":                "liver",
	"Bilirubin Total":    "liver",
	"Creatinine":         "kidney",
	"Urea":               "kidney",
	"Uric Acid":          "kidney",
	"Ferritin":           "iron",
	"Iron":               "iron",
	"Vitamin D":          "vitamins",
	"Vitamin B12":        "vitamins",
	"Folate":             "vitamins",
	"Hemoglobin":         "blood",
	"Hematocrit":         "blood",
	"RBC":                "blood",
	"WBC":                "blood",
	"Platelets":          "blood",
	"ESR":                "inflammation",
	"CRP":                "inflammation",
	"IGF-1":              "hormones",
	"SHBG":               "hormones",
	"Leptin":             "hormones",
	"Homocysteine":       "cardiovascular",
	"PSA":                "prostate",
}

// ParseLabText parses raw text from a lab PDF and extracts markers
func ParseLabText(text string, labName string, testDate time.Time) (*ParsedLabResult, error) {
	result := &ParsedLabResult{
		LabName:  labName,
		TestDate: testDate,
		Markers:  []LabMarker{},
	}

	lines := strings.Split(text, "\n")

	// Common patterns for lab results:
	// Pattern 1: "Marker Name    Value   Unit   Reference"
	// Pattern 2: "Marker Name: Value Unit (ref: min-max)"

	// Regex patterns
	valuePattern := regexp.MustCompile(`(\d+[.,]?\d*)\s*([а-яА-Яa-zA-Z/%]+)?\s*`)
	refPattern := regexp.MustCompile(`(\d+[.,]?\d*)\s*[-–]\s*(\d+[.,]?\d*)`)

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		// Try to match known marker names
		lowerLine := strings.ToLower(line)
		for russianName, normalizedName := range markerMappings {
			if strings.Contains(lowerLine, russianName) {
				marker := LabMarker{
					MarkerName: normalizedName,
					Category:   categoryMappings[normalizedName],
				}

				// Extract value
				if matches := valuePattern.FindStringSubmatch(line); len(matches) > 1 {
					if val, err := parseFloat(matches[1]); err == nil {
						marker.Value = &val
					}
					if len(matches) > 2 {
						marker.Unit = matches[2]
					}
				}

				// Extract reference range
				if matches := refPattern.FindStringSubmatch(line); len(matches) == 3 {
					if min, err := parseFloat(matches[1]); err == nil {
						marker.ReferenceMin = &min
					}
					if max, err := parseFloat(matches[2]); err == nil {
						marker.ReferenceMax = &max
					}
				}

				// Only add if we have a value
				if marker.Value != nil {
					result.Markers = append(result.Markers, marker)
				}
				break
			}
		}
	}

	return result, nil
}

// parseFloat handles both comma and dot as decimal separators
func parseFloat(s string) (float64, error) {
	s = strings.Replace(s, ",", ".", -1)
	s = strings.TrimSpace(s)
	return strconv.ParseFloat(s, 64)
}

// ValidateMarkers checks if parsed markers look valid
func ValidateMarkers(markers []LabMarker) []string {
	var warnings []string

	for _, m := range markers {
		if m.Value == nil {
			continue
		}

		// Check for obviously wrong values
		switch m.MarkerName {
		case "Testosterone Total":
			if *m.Value < 0 || *m.Value > 5000 {
				warnings = append(warnings, fmt.Sprintf("%s: value %.2f seems out of range", m.MarkerName, *m.Value))
			}
		case "TSH":
			if *m.Value < 0 || *m.Value > 100 {
				warnings = append(warnings, fmt.Sprintf("%s: value %.2f seems out of range", m.MarkerName, *m.Value))
			}
		case "Glucose":
			if *m.Value < 0 || *m.Value > 50 {
				warnings = append(warnings, fmt.Sprintf("%s: value %.2f seems out of range", m.MarkerName, *m.Value))
			}
		}
	}

	return warnings
}
