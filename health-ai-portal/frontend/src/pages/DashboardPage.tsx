import GoalsWidget from '@/components/dashboard/GoalsWidget'
import ScheduleWidget from '@/components/dashboard/ScheduleWidget'
import AlertsWidget from '@/components/dashboard/AlertsWidget'
import { Card } from '@/components/common/Card'
import { Activity, TrendingUp, Moon, Zap } from 'lucide-react'

// Quick stats (will be dynamic later)
const stats = [
  { name: 'Вес', value: '95 кг', icon: Activity, change: '-2 кг' },
  { name: 'Глубокий сон', value: '18%', icon: Moon, change: '+3%' },
  { name: 'Энергия', value: '4/10', icon: Zap, change: 'без изменений' },
  { name: 'Препаратов', value: '45+', icon: TrendingUp, change: 'активных' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Обзор вашего здоровья и протокола</p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <GoalsWidget />
        <AlertsWidget />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ScheduleWidget />
        <Card title="Последние анализы" description="Требуется сдать">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/50">
              <div>
                <p className="font-medium">Лептин</p>
                <p className="text-xs text-muted-foreground">Критически важно</p>
              </div>
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">СРОЧНО</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/50">
              <div>
                <p className="font-medium">fT3, fT4, ТТГ</p>
                <p className="text-xs text-muted-foreground">Щитовидная железа</p>
              </div>
              <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">ВАЖНО</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/50">
              <div>
                <p className="font-medium">Кортизол + АКТГ</p>
                <p className="text-xs text-muted-foreground">Надпочечники</p>
              </div>
              <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">ВАЖНО</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">IGF-1</p>
                <p className="text-xs text-muted-foreground">Эффективность ГР</p>
              </div>
              <span className="text-xs bg-muted-foreground/20 px-2 py-1 rounded">Плановый</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
