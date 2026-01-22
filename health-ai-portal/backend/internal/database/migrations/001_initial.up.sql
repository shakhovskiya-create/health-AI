-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pin_hash VARCHAR(255),
    birth_date DATE,
    height_cm INT,
    weight_kg DECIMAL(5,2),
    body_fat_pct DECIMAL(4,1),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    current_value VARCHAR(50),
    target_value VARCHAR(50),
    strategy TEXT,
    priority VARCHAR(20) CHECK (priority IN ('critical', 'high', 'medium', 'background')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'paused')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Supplements table
CREATE TABLE IF NOT EXISTS supplements (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    dose VARCHAR(100),
    time_of_day VARCHAR(20),
    category VARCHAR(50) CHECK (category IN ('morning', 'day', 'evening', 'course', 'hrt', 'on_demand')),
    mechanism TEXT,
    target TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'removed', 'paused')),
    evidence_level VARCHAR(30) CHECK (evidence_level IN ('clinical', 'preclinical', 'theoretical')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    removed_at TIMESTAMP
);

-- Interactions table
CREATE TABLE IF NOT EXISTS interactions (
    id SERIAL PRIMARY KEY,
    supplement_1_id INT REFERENCES supplements(id) ON DELETE CASCADE,
    supplement_2_id INT REFERENCES supplements(id) ON DELETE CASCADE,
    interaction_type VARCHAR(30) CHECK (interaction_type IN ('critical', 'warning', 'synergy')),
    description TEXT,
    solution TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lab results table
CREATE TABLE IF NOT EXISTS lab_results (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    test_date DATE NOT NULL,
    lab_name VARCHAR(100),
    marker_name VARCHAR(200) NOT NULL,
    value DECIMAL(10,3),
    unit VARCHAR(50),
    reference_min DECIMAL(10,3),
    reference_max DECIMAL(10,3),
    category VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cycles table
CREATE TABLE IF NOT EXISTS cycles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    cycle_date DATE NOT NULL,
    cycle_type VARCHAR(50) CHECK (cycle_type IN ('full', 'partial', 'control')),
    verdict VARCHAR(20) CHECK (verdict IN ('go', 'wait', 'stop')),
    input_data JSONB,
    master_curator_output TEXT,
    red_team_output TEXT,
    meta_supervisor_output TEXT,
    decisions JSONB,
    required_labs JSONB,
    next_review_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    workout_date DATE NOT NULL,
    workout_type VARCHAR(50),
    duration_min INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    workout_id INT REFERENCES workouts(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    sets INT,
    reps VARCHAR(50),
    weight_kg DECIMAL(5,1),
    notes TEXT,
    order_index INT DEFAULT 0
);

-- Daily metrics table
CREATE TABLE IF NOT EXISTS daily_metrics (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    steps INT,
    sleep_hours DECIMAL(3,1),
    deep_sleep_pct INT,
    hrv INT,
    resting_hr INT,
    blood_pressure_sys INT,
    blood_pressure_dia INT,
    glucose DECIMAL(4,1),
    energy_level INT CHECK (energy_level BETWEEN 1 AND 10),
    mood_level INT CHECK (mood_level BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, metric_date)
);

-- Risks table
CREATE TABLE IF NOT EXISTS risks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    cause TEXT,
    symptoms TEXT,
    action TEXT,
    severity VARCHAR(20) CHECK (severity IN ('critical', 'high', 'medium')),
    related_supplements JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) CHECK (reminder_type IN ('supplement', 'lab', 'workout')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    time TIME,
    days_of_week JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI analyses table
CREATE TABLE IF NOT EXISTS ai_analyses (
    id SERIAL PRIMARY KEY,
    cycle_id INT REFERENCES cycles(id) ON DELETE CASCADE,
    role VARCHAR(50) CHECK (role IN ('master_curator', 'red_team', 'meta_supervisor')),
    prompt TEXT,
    response TEXT,
    model VARCHAR(50),
    tokens_used INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_supplements_user_id ON supplements(user_id);
CREATE INDEX idx_supplements_status ON supplements(status);
CREATE INDEX idx_supplements_category ON supplements(category);
CREATE INDEX idx_lab_results_user_id ON lab_results(user_id);
CREATE INDEX idx_lab_results_test_date ON lab_results(test_date);
CREATE INDEX idx_lab_results_marker_name ON lab_results(marker_name);
CREATE INDEX idx_cycles_user_id ON cycles(user_id);
CREATE INDEX idx_cycles_cycle_date ON cycles(cycle_date);
CREATE INDEX idx_daily_metrics_user_date ON daily_metrics(user_id, metric_date);

-- Insert default user
INSERT INTO users (name, birth_date, height_cm, weight_kg, body_fat_pct)
VALUES ('Anton', '1984-08-30', 186, 95, 18)
ON CONFLICT DO NOTHING;
