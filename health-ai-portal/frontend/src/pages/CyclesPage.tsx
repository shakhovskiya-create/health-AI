import { Card } from '@/components/common/Card'
import { Plus, CheckCircle, AlertCircle, XCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data based on 08_cycles_history.md
const cycles = [
  {
    id: 2,
    date: '2026-01-22',
    type: 'control',
    verdict: 'stop',
    title: 'CYCLE-0002 — Диагностический',
    summary: 'СТОП — Недостаточно данных для принятия решений',
    changes: ['Убран Суглат', 'Убран IF 16:8', 'Обязательная диагностика'],
  },
  {
    id: 1,
    date: '2026-01-01',
    type: 'full',
    verdict: 'wait',
    title: 'CYCLE-0001 — Начальный',
    summary: 'Первичная настройка протокола v11',
    changes: ['Установлен базовый стек', 'Определены цели'],
  },
]

const verdictStyles = {
  go: { bg: 'bg-green-500/10', border: 'border-green-500', icon: CheckCircle, text: 'text-green-500', label: 'МОЖНО' },
  wait: { bg: 'bg-yellow-500/10', border: 'border-yellow-500', icon: AlertCircle, text: 'text-yellow-500', label: 'ЖДЁМ' },
  stop: { bg: 'bg-red-500/10', border: 'border-red-500', icon: XCircle, text: 'text-red-500', label: 'СТОП' },
}

export default function CyclesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">История циклов</h1>
          <p className="text-muted-foreground">Аналитические циклы и решения</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Новый цикл
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {cycles.map((cycle, index) => {
          const style = verdictStyles[cycle.verdict as keyof typeof verdictStyles]
          const Icon = style.icon
          return (
            <Card
              key={cycle.id}
              className={cn(
                'relative hover:border-primary/50 transition-colors cursor-pointer',
                style.bg,
                `border-l-4 ${style.border}`
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn('p-2 rounded-lg', style.bg)}>
                  <Icon className={cn('h-6 w-6', style.text)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{cycle.title}</h3>
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', style.bg, style.text)}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{cycle.date}</p>
                  <p className="text-sm mb-3">{cycle.summary}</p>
                  {cycle.changes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {cycle.changes.map((change, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                          {change}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Current protocol version */}
      <Card title="Текущий протокол" description="v12.0 от 2026-01-22">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Препаратов в стеке</p>
            <p className="text-2xl font-bold">45+</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Критических целей</p>
            <p className="text-2xl font-bold">4</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Следующий обзор</p>
            <p className="text-2xl font-bold">4 нед</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
