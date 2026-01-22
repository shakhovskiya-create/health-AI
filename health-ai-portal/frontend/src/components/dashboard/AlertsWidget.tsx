import { Card } from '@/components/common/Card'
import { AlertTriangle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Static alerts based on protocol
const alerts = [
  {
    id: 1,
    type: 'critical',
    title: 'Грейпфрут ЗАПРЕЩЁН',
    description: 'При приёме рапамицина избегать грейпфрут',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Берберин',
    description: 'Пропустить в день рапамицина (суббота)',
  },
  {
    id: 3,
    type: 'info',
    title: 'Лептин мониторинг',
    description: 'Сдать анализ через 4 недели после отмены Суглата',
  },
  {
    id: 4,
    type: 'warning',
    title: 'NOR-BNI',
    description: 'Не чаще 1 раза в 4-6 недель',
  },
]

const alertStyles = {
  critical: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/50',
    icon: XCircle,
    iconColor: 'text-red-500',
  },
  warning: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/50',
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/50',
    icon: Info,
    iconColor: 'text-blue-500',
  },
}

export default function AlertsWidget() {
  return (
    <Card title="Напоминания" description="Критичные предупреждения">
      <div className="space-y-3">
        {alerts.map((alert) => {
          const style = alertStyles[alert.type as keyof typeof alertStyles]
          const Icon = style.icon
          return (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border',
                style.bg,
                style.border
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', style.iconColor)} />
              <div>
                <h4 className="font-medium text-sm">{alert.title}</h4>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
