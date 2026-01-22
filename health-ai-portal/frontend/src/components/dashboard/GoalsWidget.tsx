import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsApi } from '@/api/client'
import { Card } from '@/components/common/Card'
import { GoalForm } from '@/components/goals/GoalForm'
import { ConfirmDialog } from '@/components/common/Modal'
import { cn } from '@/lib/utils'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Goal, Priority } from '@/types'

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

const priorityLabels: Record<Priority, string> = {
  critical: 'КРИТИЧНО',
  high: 'ВЫСОКИЙ',
  medium: 'СРЕДНИЙ',
  background: 'ФОНОВЫЙ',
}

const priorityProgressColors: Record<Priority, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  background: 'bg-green-500',
}

// Parse values like "3/10", "50%", "3", etc.
function parseProgress(current: string | null, target: string | null): number | null {
  if (!current || !target) return null

  // Try parsing "X/Y" format
  const currentMatch = current.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/)
  const targetMatch = target.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/)

  if (currentMatch && targetMatch) {
    const currentNum = parseFloat(currentMatch[1])
    const targetNum = parseFloat(targetMatch[1])
    const maxNum = parseFloat(targetMatch[2])
    if (maxNum > 0) {
      return Math.min(100, Math.round((currentNum / targetNum) * 100))
    }
  }

  // Try parsing percentage format
  const currentPct = current.match(/^(\d+(?:\.\d+)?)\s*%?$/)
  const targetPct = target.match(/^(\d+(?:\.\d+)?)\s*%?$/)

  if (currentPct && targetPct) {
    const currentNum = parseFloat(currentPct[1])
    const targetNum = parseFloat(targetPct[1])
    if (targetNum > 0) {
      return Math.min(100, Math.round((currentNum / targetNum) * 100))
    }
  }

  // Try simple number parsing
  const currentSimple = parseFloat(current)
  const targetSimple = parseFloat(target)

  if (!isNaN(currentSimple) && !isNaN(targetSimple) && targetSimple > 0) {
    return Math.min(100, Math.round((currentSimple / targetSimple) * 100))
  }

  return null
}

export default function GoalsWidget() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null)

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalsApi.list,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => goalsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      setDeletingGoal(null)
    },
  })

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingGoal(null)
  }

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
    <>
      <Card
        title="Цели"
        description="Прогресс по ключевым целям"
        className="col-span-2"
        action={
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Добавить
          </button>
        }
      >
        <div className="space-y-3">
          {goals?.filter(g => g.status === 'active').map((goal) => {
            const priority = (goal.priority || 'medium') as Priority
            const progress = parseProgress(goal.current_value, goal.target_value)
            return (
              <div
                key={goal.id}
                className={cn(
                  'rounded-lg border-l-4 p-4 group relative',
                  priorityStyles[priority]
                )}
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-1.5 rounded-md bg-background/80 hover:bg-background transition-colors"
                    title="Редактировать"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setDeletingGoal(goal)}
                    className="p-1.5 rounded-md bg-background/80 hover:bg-red-500/20 text-red-500 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
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
                        {priorityLabels[priority]}
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
                    {progress !== null && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {progress}%
                      </div>
                    )}
                  </div>
                </div>
                {/* Progress bar */}
                {progress !== null && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          priorityProgressColors[priority]
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {(!goals || goals.filter(g => g.status === 'active').length === 0) && (
            <p className="text-center text-muted-foreground py-4">Нет активных целей</p>
          )}
        </div>
      </Card>

      {/* Goal Form Modal */}
      <GoalForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        goal={editingGoal}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        onConfirm={() => deletingGoal && deleteMutation.mutate(deletingGoal.id)}
        title="Удалить цель?"
        description={`Вы уверены, что хотите удалить цель "${deletingGoal?.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}
