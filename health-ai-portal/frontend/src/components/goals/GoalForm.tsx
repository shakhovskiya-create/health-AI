import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsApi } from '@/api/client'
import { Modal } from '@/components/common/Modal'
import { Input, Textarea, Select } from '@/components/common/Input'
import type { Goal } from '@/types'

interface GoalFormData {
  name: string
  current_value: string
  target_value: string
  strategy: string
  priority: string
}

interface GoalFormProps {
  isOpen: boolean
  onClose: () => void
  goal?: Goal | null
}

const priorityOptions = [
  { value: 'critical', label: 'КРИТИЧНО' },
  { value: 'high', label: 'ВЫСОКИЙ' },
  { value: 'medium', label: 'СРЕДНИЙ' },
  { value: 'background', label: 'ФОНОВЫЙ' },
]

export function GoalForm({ isOpen, onClose, goal }: GoalFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!goal

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    defaultValues: goal
      ? {
          name: goal.name,
          current_value: goal.current_value || '',
          target_value: goal.target_value || '',
          strategy: goal.strategy || '',
          priority: goal.priority || '',
        }
      : {},
  })

  const createMutation = useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Goal>) => goalsApi.update(goal!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      handleClose()
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (data: GoalFormData) => {
    const payload = {
      ...data,
      current_value: data.current_value || null,
      target_value: data.target_value || null,
      strategy: data.strategy || null,
      priority: data.priority || null,
    }

    if (isEditing) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Редактировать цель' : 'Добавить цель'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Название цели *"
          placeholder="Например: Когнитивка (память, речь)"
          error={errors.name?.message}
          {...register('name', { required: 'Название обязательно' })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Текущее значение"
            placeholder="3/10"
            {...register('current_value')}
          />
          <Input
            label="Целевое значение"
            placeholder="9/10"
            {...register('target_value')}
          />
        </div>

        <Select
          label="Приоритет"
          options={priorityOptions}
          placeholder="Выберите приоритет"
          {...register('priority')}
        />

        <Textarea
          label="Стратегия достижения"
          placeholder="Как планируете достичь цели..."
          {...register('strategy')}
        />

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
