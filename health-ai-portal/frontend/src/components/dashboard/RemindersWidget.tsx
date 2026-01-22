import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { remindersApi } from '@/api/client'
import { Card } from '@/components/common/Card'
import { Modal } from '@/components/common/Modal'
import { Input, Textarea, Select } from '@/components/common/Input'
import { cn } from '@/lib/utils'
import { Plus, Bell, BellOff, Clock, Pill, TestTube2, Dumbbell, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { Reminder } from '@/types'

const typeIcons = {
  supplement: Pill,
  lab: TestTube2,
  workout: Dumbbell,
}

const typeLabels = {
  supplement: 'Препарат',
  lab: 'Анализ',
  workout: 'Тренировка',
}

const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

interface ReminderFormData {
  title: string
  description: string
  reminder_type: string
  time: string
  days_of_week: number[]
}

export default function RemindersWidget() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders', 'today'],
    queryFn: remindersApi.getToday,
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => remindersApi.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Reminder>) => remindersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      handleCloseForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Reminder> }) =>
      remindersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      handleCloseForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => remindersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
  })

  const { register, handleSubmit, reset, setValue, watch } = useForm<ReminderFormData>({
    defaultValues: {
      title: '',
      description: '',
      reminder_type: 'supplement',
      time: '09:00',
      days_of_week: [1, 2, 3, 4, 5, 6, 7],
    },
  })

  const selectedDays = watch('days_of_week') || []

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    reset({
      title: reminder.title,
      description: reminder.description || '',
      reminder_type: reminder.reminder_type || 'supplement',
      time: reminder.time || '09:00',
      days_of_week: reminder.days_of_week || [1, 2, 3, 4, 5, 6, 7],
    })
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingReminder(null)
    reset()
  }

  const onSubmit = (data: ReminderFormData) => {
    const reminderData = {
      ...data,
      reminder_type: data.reminder_type as 'supplement' | 'lab' | 'workout',
    }

    if (editingReminder) {
      updateMutation.mutate({ id: editingReminder.id, data: reminderData })
    } else {
      createMutation.mutate(reminderData)
    }
  }

  const toggleDay = (day: number) => {
    const current = selectedDays
    if (current.includes(day)) {
      setValue('days_of_week', current.filter((d) => d !== day))
    } else {
      setValue('days_of_week', [...current, day].sort())
    }
  }

  if (isLoading) {
    return (
      <Card title="Напоминания">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-lg" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card
        title="Напоминания"
        description="На сегодня"
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
        <div className="space-y-2">
          {reminders && reminders.length > 0 ? (
            reminders.slice(0, 5).map((reminder) => {
              const Icon = reminder.reminder_type
                ? typeIcons[reminder.reminder_type]
                : Bell
              return (
                <div
                  key={reminder.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg group relative',
                    reminder.is_active ? 'bg-muted/50' : 'bg-muted/20 opacity-60'
                  )}
                >
                  <button
                    onClick={() => toggleMutation.mutate(reminder.id)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      reminder.is_active
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {reminder.is_active ? (
                      <Icon className="h-4 w-4" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-medium text-sm truncate', !reminder.is_active && 'line-through')}>
                      {reminder.title}
                    </p>
                    {reminder.time && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {reminder.time}
                      </p>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(reminder.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-center text-muted-foreground py-4 text-sm">
              Нет активных напоминаний
            </p>
          )}
        </div>
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingReminder ? 'Редактировать напоминание' : 'Новое напоминание'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Название"
            placeholder="Например: Принять витамин D"
            {...register('title', { required: true })}
          />
          <Textarea
            label="Описание"
            placeholder="Дополнительная информация..."
            {...register('description')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Тип"
              options={[
                { value: 'supplement', label: 'Препарат' },
                { value: 'lab', label: 'Анализ' },
                { value: 'workout', label: 'Тренировка' },
              ]}
              {...register('reminder_type')}
            />
            <Input
              label="Время"
              type="time"
              {...register('time')}
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Дни недели</p>
            <div className="flex gap-1">
              {dayLabels.map((label, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleDay(index + 1)}
                  className={cn(
                    'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                    selectedDays.includes(index + 1)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleCloseForm}
              className="px-4 py-2 text-sm rounded-md hover:bg-muted transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {editingReminder ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
