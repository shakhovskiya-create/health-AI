import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { interactionsApi, supplementsApi } from '@/api/client'
import { Modal } from '@/components/common/Modal'
import { Select, Textarea } from '@/components/common/Input'
import type { Interaction, Supplement } from '@/types'

interface InteractionFormData {
  supplement_1_id: string
  supplement_2_id: string
  interaction_type: string
  description: string
  solution: string
}

interface InteractionFormProps {
  isOpen: boolean
  onClose: () => void
  interaction?: Interaction | null
}

const interactionTypeOptions = [
  { value: 'critical', label: 'Критическое — требует немедленного внимания' },
  { value: 'warning', label: 'Предупреждение — следить за эффектами' },
  { value: 'synergy', label: 'Синергия — усиливают друг друга' },
]

export function InteractionForm({ isOpen, onClose, interaction }: InteractionFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!interaction

  const { data: supplements } = useQuery({
    queryKey: ['supplements'],
    queryFn: () => supplementsApi.list({ status: 'active' }),
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<InteractionFormData>({
    defaultValues: interaction
      ? {
          supplement_1_id: interaction.supplement_1_id.toString(),
          supplement_2_id: interaction.supplement_2_id.toString(),
          interaction_type: interaction.interaction_type || '',
          description: interaction.description || '',
          solution: interaction.solution || '',
        }
      : {},
  })

  const supplement1Id = watch('supplement_1_id')

  const createMutation = useMutation({
    mutationFn: interactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Interaction>) =>
      interactionsApi.update(interaction!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] })
      handleClose()
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (data: InteractionFormData) => {
    const payload = {
      supplement_1_id: parseInt(data.supplement_1_id),
      supplement_2_id: parseInt(data.supplement_2_id),
      interaction_type: data.interaction_type || null,
      description: data.description || null,
      solution: data.solution || null,
    }

    if (isEditing) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Filter out the selected supplement from the second dropdown
  const supplementOptions = supplements?.map((s: Supplement) => ({
    value: s.id.toString(),
    label: s.name,
  })) || []

  const supplement2Options = supplementOptions.filter(
    (s) => s.value !== supplement1Id
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Редактировать взаимодействие' : 'Добавить взаимодействие'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Препарат 1 *"
            options={supplementOptions}
            placeholder="Выберите препарат"
            error={errors.supplement_1_id?.message}
            disabled={isEditing}
            {...register('supplement_1_id', { required: 'Выберите препарат' })}
          />
          <Select
            label="Препарат 2 *"
            options={supplement2Options}
            placeholder="Выберите препарат"
            error={errors.supplement_2_id?.message}
            disabled={isEditing}
            {...register('supplement_2_id', { required: 'Выберите препарат' })}
          />
        </div>

        <Select
          label="Тип взаимодействия *"
          options={interactionTypeOptions}
          placeholder="Выберите тип"
          error={errors.interaction_type?.message}
          {...register('interaction_type', { required: 'Выберите тип взаимодействия' })}
        />

        <Textarea
          label="Описание"
          placeholder="Опишите суть взаимодействия..."
          {...register('description')}
        />

        <Textarea
          label="Решение / Рекомендация"
          placeholder="Как избежать негативных последствий или усилить эффект..."
          {...register('solution')}
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
