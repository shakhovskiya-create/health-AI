import { Card } from '@/components/common/Card'
import { User, Calendar, Ruler, Scale, Target, AlertTriangle } from 'lucide-react'

// Based on 05_profile_constant.md
const profile = {
  name: 'Антон',
  birthDate: '30.08.1984',
  age: 41,
  height: 186,
  weight: 95,
  bodyFat: 18,
}

const goals = [
  { name: 'Здоровье и долголетие', priority: 1 },
  { name: 'Низкая жировая масса', priority: 2 },
  { name: 'Сухая мышечная масса', priority: 3 },
  { name: 'Когнитивная продуктивность', priority: 4 },
  { name: 'Либидо и качество жизни', priority: 5 },
]

const problems = [
  'Бессонница',
  'Сильное ухудшение памяти',
  'Низкая энергия',
  'Акне (на фоне ГЗТ)',
  'Ортостатическая гипотензия',
  'Снижение мотивации',
]

const activity = {
  workouts: '3 раза в неделю',
  steps: '~5000/день',
  if: '16/8 (отменён)',
  trainingTime: '~18:00',
}

const hrt = [
  { name: 'Тестостерон энантат', dose: '150 мг', frequency: '2×/неделю' },
  { name: 'Примоболан', dose: '200 мг', frequency: '2×/неделю' },
  { name: 'HCG', dose: '500 IU', frequency: '2×/неделю' },
  { name: 'ГР (Genotropin)', dose: '5 IU', frequency: 'ежедневно' },
]

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Профиль</h1>
        <p className="text-muted-foreground">Постоянный контекст</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Basic info */}
        <Card title="Основные данные">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{profile.name}</p>
                <p className="text-sm text-muted-foreground">{profile.age} лет</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Дата рождения</p>
                  <p className="text-sm font-medium">{profile.birthDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Рост</p>
                  <p className="text-sm font-medium">{profile.height} см</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Вес</p>
                  <p className="text-sm font-medium">~{profile.weight} кг</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Жир</p>
                  <p className="text-sm font-medium">~{profile.bodyFat}%</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Goals */}
        <Card title="Цели (приоритет)">
          <div className="space-y-2">
            {goals.map((goal) => (
              <div
                key={goal.name}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  {goal.priority}
                </span>
                <span className="text-sm">{goal.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Known problems */}
        <Card title="Известные проблемы">
          <div className="space-y-2">
            {problems.map((problem) => (
              <div
                key={problem}
                className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5"
              >
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                <span className="text-sm">{problem}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity */}
        <Card title="Текущая активность">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Силовые</p>
              <p className="font-medium">{activity.workouts}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Шаги</p>
              <p className="font-medium">{activity.steps}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">IF</p>
              <p className="font-medium">{activity.if}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Время тренировки</p>
              <p className="font-medium">{activity.trainingTime}</p>
            </div>
          </div>
        </Card>

        {/* HRT */}
        <Card title="Текущая ГЗТ">
          <div className="space-y-3">
            {hrt.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.frequency}</p>
                </div>
                <span className="text-sm font-medium text-primary">{item.dose}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
