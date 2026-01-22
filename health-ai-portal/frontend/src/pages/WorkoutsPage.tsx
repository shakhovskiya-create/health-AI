import { Card } from '@/components/common/Card'
import { Plus, Calendar, Dumbbell, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock workout plan
const weekPlan = [
  { day: 'Пн', type: 'Push', exercises: ['Жим лёжа', 'Жим гантелей', 'Разводки', 'Трицепс'] },
  { day: 'Вт', type: 'Rest', exercises: [] },
  { day: 'Ср', type: 'Pull', exercises: ['Подтягивания', 'Тяга штанги', 'Тяга гантели', 'Бицепс'] },
  { day: 'Чт', type: 'Rest', exercises: [] },
  { day: 'Пт', type: 'Legs', exercises: ['Присед', 'Жим ногами', 'Выпады', 'Икры'] },
  { day: 'Сб', type: 'Rest (Рапамицин)', exercises: [] },
  { day: 'Вс', type: 'Rest', exercises: [] },
]

const recentWorkouts = [
  { date: '2026-01-20', type: 'Push', duration: 65, exercises: 8 },
  { date: '2026-01-18', type: 'Pull', duration: 60, exercises: 7 },
  { date: '2026-01-15', type: 'Legs', duration: 55, exercises: 6 },
]

const keyExercises = [
  { name: 'Жим лёжа', current: '100 кг', goal: '120 кг', progress: 83 },
  { name: 'Присед', current: '120 кг', goal: '140 кг', progress: 86 },
  { name: 'Становая', current: '140 кг', goal: '160 кг', progress: 88 },
  { name: 'Подтягивания', current: '+20 кг', goal: '+30 кг', progress: 67 },
]

export default function WorkoutsPage() {
  const today = new Date().getDay()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Тренировки</h1>
          <p className="text-muted-foreground">План и прогресс</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Записать тренировку
        </button>
      </div>

      {/* Weekly plan */}
      <Card title="Недельный план" description="Push/Pull/Legs">
        <div className="grid grid-cols-7 gap-2">
          {weekPlan.map((day, index) => {
            const isToday = index === (today === 0 ? 6 : today - 1)
            const isWorkout = day.type !== 'Rest' && !day.type.includes('Rest')
            return (
              <div
                key={day.day}
                className={cn(
                  'p-3 rounded-lg text-center',
                  isToday && 'ring-2 ring-primary',
                  isWorkout ? 'bg-primary/10' : 'bg-muted/50'
                )}
              >
                <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
                <p className={cn('font-medium text-sm', isWorkout && 'text-primary')}>
                  {day.type}
                </p>
                {day.exercises.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {day.exercises.length} упр.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent workouts */}
        <Card title="Последние тренировки">
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div
                key={workout.date}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Dumbbell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{workout.type}</p>
                    <p className="text-xs text-muted-foreground">{workout.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">{workout.duration} мин</p>
                  <p className="text-xs text-muted-foreground">{workout.exercises} упражнений</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Key lifts progress */}
        <Card title="Прогрессия" description="Ключевые упражнения">
          <div className="space-y-4">
            {keyExercises.map((exercise) => (
              <div key={exercise.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{exercise.name}</span>
                  <span>
                    {exercise.current} → <span className="text-primary">{exercise.goal}</span>
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${exercise.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Тренировок в неделю</p>
          <p className="text-2xl font-bold">2-3</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Шагов в день</p>
          <p className="text-2xl font-bold">~5000</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">LBM (сухая масса)</p>
          <p className="text-2xl font-bold">77 кг</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Цель LBM</p>
          <p className="text-2xl font-bold text-primary">82+ кг</p>
        </Card>
      </div>
    </div>
  )
}
