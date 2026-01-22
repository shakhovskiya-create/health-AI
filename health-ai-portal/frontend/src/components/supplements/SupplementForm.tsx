import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supplementsApi } from '@/api/client'
import { Modal } from '@/components/common/Modal'
import { Input, Textarea, Select } from '@/components/common/Input'
import type { Supplement } from '@/types'

interface SupplementFormData {
  name: string
  dose: string
  time_of_day: string
  category: string
  mechanism: string
  target: string
  evidence_level: string
  notes: string
}

interface SupplementFormProps {
  isOpen: boolean
  onClose: () => void
  supplement?: Supplement | null
}

const categoryOptions = [
  { value: 'morning', label: 'Утренний блок' },
  { value: 'day', label: 'Дневной блок' },
  { value: 'evening', label: 'Вечерний блок' },
  { value: 'course', label: 'Курсовые' },
  { value: 'hrt', label: 'ГЗТ' },
  { value: 'on_demand', label: 'По требованию' },
]

const timeOptions = [
  { value: '05:00', label: '05:00 — Натощак' },
  { value: '07:30', label: '07:30 — Завтрак' },
  { value: '13:00', label: '13:00 — Обед' },
  { value: '16:00', label: '16:00 — Перед тренировкой' },
  { value: '22:00', label: '22:00 — Перед сном' },
]

const evidenceOptions = [
  { value: 'clinical', label: 'Клинические исследования' },
  { value: 'preclinical', label: 'Преклинические' },
  { value: 'theoretical', label: 'Теоретические' },
]

export function SupplementForm({ isOpen, onClose, supplement }: SupplementFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!supplement

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplementFormData>({
    defaultValues: supplement
      ? {
          name: supplement.name,
          dose: supplement.dose || '',
          time_of_day: supplement.time_of_day || '',
          category: supplement.category || '',
          mechanism: supplement.mechanism || '',
          target: supplement.target || '',
          evidence_level: supplement.evidence_level || '',
          notes: supplement.notes || '',
        }
      : {},
  })

  const createMutation = useMutation({
    mutationFn: supplementsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Supplement>) =>
      supplementsApi.update(supplement!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] })
      handleClose()
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (data: SupplementFormData) => {
    const payload = {
      ...data,
      dose: data.dose || null,
      time_of_day: data.time_of_day || null,
      category: data.category || null,
      mechanism: data.mechanism || null,
      target: data.target || null,
      evidence_level: data.evidence_level || null,
      notes: data.notes || null,
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
      title={isEditing ? 'Редактировать препарат' : 'Добавить препарат'}
      description={isEditing ? supplement?.name : 'Заполните информацию о препарате'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Название *"
            placeholder="Например: Mg L-Threonate"
            error={errors.name?.message}
            {...register('name', { required: 'Название обязательно' })}
          />
          <Input
            label="Дозировка"
            placeholder="Например: 1000 мг"
            {...register('dose')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Время приёма"
            options={timeOptions}
            placeholder="Выберите время"
            {...register('time_of_day')}
          />
          <Select
            label="Категория"
            options={categoryOptions}
            placeholder="Выберите категорию"
            {...register('category')}
          />
        </div>

        <Textarea
          label="Механизм действия"
          placeholder="Как работает препарат..."
          {...register('mechanism')}
        />

        <Input
          label="Цель"
          placeholder="Для чего принимается"
          {...register('target')}
        />

        <Select
          label="Уровень доказательности"
          options={evidenceOptions}
          placeholder="Выберите уровень"
          {...register('evidence_level')}
        />

        <Textarea
          label="Заметки"
          placeholder="Дополнительная информация..."
          {...register('notes')}
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
