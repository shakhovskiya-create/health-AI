import { useQuery } from '@tanstack/react-query'
import { goalsApi } from '@/api/client'
import { Card } from '@/components/common/Card'
import { cn } from '@/lib/utils'
import type { Priority } from '@/types'

const priorityStyles: Record<Priority, string> = {
  critical: 'border-l-red-500 bg-red-500/5',
  high: 'border-l-orange-500 bg-orange-500/5',
  medium: 'border-l-yellow-500 bg-yellow-500/5',
  background: 'border-l-green-500 bg-green-500/5',
}

const priorityBadge: Record<Priority, { bg: string; text: string }> = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-500' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
  background: { bg: 'bg-green-500/10', text: 'text-green-500' },
}

export default function GoalsWidget() {
  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalsApi.list,
  })

  if (isLoading) {
    return (
      <Card title="Цели" className="col-span-2">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card title="Цели" description="Прогресс по ключевым целям" className="col-span-2">
      <div className="space-y-3">
        {goals?.filter(g => g.status === 'active').map((goal) => {
          const priority = (goal.priority || 'medium') as Priority
          return (
            <div
              key={goal.id}
              className={cn(
                'rounded-lg border-l-4 p-4',
                priorityStyles[priority]
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{goal.name}</h4>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        priorityBadge[priority].bg,
                        priorityBadge[priority].text
                      )}
                    >
                      {priority === 'critical' && 'КРИТИЧНО'}
                      {priority === 'high' && 'ВЫСОКИЙ'}
                      {priority === 'medium' && 'СРЕДНИЙ'}
                      {priority === 'background' && 'ФОНОВЫЙ'}
                    </span>
                  </div>
                  {goal.strategy && (
                    <p className="text-sm text-muted-foreground truncate">{goal.strategy}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm">
                    <span className="text-muted-foreground">{goal.current_value}</span>
                    <span className="mx-1">→</span>
                    <span className="font-medium">{goal.target_value}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {(!goals || goals.length === 0) && (
          <p className="text-center text-muted-foreground py-4">Нет активных целей</p>
        )}
      </div>
    </Card>
  )
}
