export interface Supplement {
  id: number
  user_id: number
  name: string
  dose: string | null
  time_of_day: string | null
  category: 'morning' | 'day' | 'evening' | 'course' | 'hrt' | 'on_demand' | null
  mechanism: string | null
  target: string | null
  status: 'active' | 'removed' | 'paused'
  evidence_level: 'clinical' | 'preclinical' | 'theoretical' | null
  notes: string | null
  created_at: string
  updated_at: string
  removed_at: string | null
}

export interface Goal {
  id: number
  user_id: number
  name: string
  current_value: string | null
  target_value: string | null
  strategy: string | null
  priority: 'critical' | 'high' | 'medium' | 'background' | null
  status: 'active' | 'achieved' | 'paused'
  created_at: string
  updated_at: string
}

export interface LabResult {
  id: number
  user_id: number
  test_date: string
  lab_name: string | null
  marker_name: string
  value: number | null
  unit: string | null
  reference_min: number | null
  reference_max: number | null
  category: string | null
  notes: string | null
  created_at: string
}

export interface LabTrend {
  marker_name: string
  unit: string
  data_points: {
    date: string
    value: number
  }[]
}

export interface Interaction {
  id: number
  supplement_1_id: number
  supplement_2_id: number
  supplement_1_name?: string
  supplement_2_name?: string
  interaction_type: 'critical' | 'warning' | 'synergy' | null
  description: string | null
  solution: string | null
  created_at: string
}

export interface Cycle {
  id: number
  user_id: number
  cycle_date: string
  cycle_type: 'full' | 'partial' | 'control' | null
  verdict: 'go' | 'wait' | 'stop' | null
  input_data: Record<string, unknown>
  master_curator_output: string | null
  red_team_output: string | null
  meta_supervisor_output: string | null
  decisions: Record<string, unknown>
  required_labs: string[]
  next_review_date: string | null
  created_at: string
  updated_at: string
}

export interface DailyMetrics {
  id: number
  user_id: number
  metric_date: string
  weight_kg: number | null
  steps: number | null
  sleep_hours: number | null
  deep_sleep_pct: number | null
  hrv: number | null
  resting_hr: number | null
  blood_pressure_sys: number | null
  blood_pressure_dia: number | null
  glucose: number | null
  energy_level: number | null
  mood_level: number | null
  notes: string | null
  created_at: string
}

export interface ScheduleItem {
  time_of_day: string
  supplements: Supplement[]
}

export type Priority = 'critical' | 'high' | 'medium' | 'background'

export const priorityColors: Record<Priority, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  background: 'bg-green-500',
}

export const priorityLabels: Record<Priority, string> = {
  critical: 'КРИТИЧНО',
  high: 'ВЫСОКИЙ',
  medium: 'СРЕДНИЙ',
  background: 'ФОНОВЫЙ',
}
