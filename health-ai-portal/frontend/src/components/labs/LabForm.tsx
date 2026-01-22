import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { labsApi } from '@/api/client'
import { Modal } from '@/components/common/Modal'
import { Input, Select } from '@/components/common/Input'
import type { LabResult } from '@/types'
import { format } from 'date-fns'

interface LabFormData {
  test_date: string
  marker_name: string
  value: string
  unit: string
  reference_min: string
  reference_max: string
  category: string
  lab_name: string
  notes: string
}

interface LabFormProps {
  isOpen: boolean
  onClose: () => void
  labResult?: LabResult | null
}

const categoryOptions = [
  { value: 'hormones', label: 'Гормоны' },
  { value: 'lipids', label: 'Липиды' },
  { value: 'liver', label: 'Печень' },
  { value: 'kidney', label: 'Почки' },
  { value: 'thyroid', label: 'Щитовидная железа' },
  { value: 'blood', label: 'Общий анализ крови' },
  { value: 'inflammation', label: 'Воспаление' },
  { value: 'vitamins', label: 'Витамины' },
  { value: 'minerals', label: 'Минералы' },
  { value: 'other', label: 'Другое' },
]

const commonMarkers = [
  { value: 'Лептин', label: 'Лептин' },
  { value: 'fT3', label: 'fT3' },
  { value: 'fT4', label: 'fT4' },
  { value: 'ТТГ', label: 'ТТГ' },
  { value: 'Кортизол', label: 'Кортизол' },
  { value: 'АКТГ', label: 'АКТГ' },
  { value: 'Тестостерон общий', label: 'Тестостерон общий' },
  { value: 'Тестостерон свободный', label: 'Тестостерон свободный' },
  { value: 'SHBG', label: 'SHBG' },
  { value: 'Эстрадиол', label: 'Эстрадиол' },
  { value: 'IGF-1', label: 'IGF-1' },
  { value: 'Гематокрит', label: 'Гематокрит' },
  { value: 'АЛТ', label: 'АЛТ' },
  { value: 'АСТ', label: 'АСТ' },
  { value: 'ГГТ', label: 'ГГТ' },
  { value: 'Глюкоза', label: 'Глюкоза' },
  { value: 'Триглицериды', label: 'Триглицериды' },
  { value: 'Холестерин общий', label: 'Холестерин общий' },
  { value: 'СРБ', label: 'СРБ' },
  { value: 'IL-6', label: 'IL-6' },
]

export function LabForm({ isOpen, onClose, labResult }: LabFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!labResult

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LabFormData>({
    defaultValues: labResult
      ? {
          test_date: format(new Date(labResult.test_date), 'yyyy-MM-dd'),
          marker_name: labResult.marker_name,
          value: labResult.value?.toString() || '',
          unit: labResult.unit || '',
          reference_min: labResult.reference_min?.toString() || '',
          reference_max: labResult.reference_max?.toString() || '',
          category: labResult.category || '',
          lab_name: labResult.lab_name || '',
          notes: labResult.notes || '',
        }
      : {
          test_date: format(new Date(), 'yyyy-MM-dd'),
        },
  })

  const createMutation = useMutation({
    mutationFn: labsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<LabResult>) =>
      labsApi.update(labResult!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] })
      handleClose()
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (data: LabFormData) => {
    const payload = {
      test_date: new Date(data.test_date).toISOString(),
      marker_name: data.marker_name,
      value: data.value ? parseFloat(data.value) : null,
      unit: data.unit || null,
      reference_min: data.reference_min ? parseFloat(data.reference_min) : null,
      reference_max: data.reference_max ? parseFloat(data.reference_max) : null,
      category: data.category || null,
      lab_name: data.lab_name || null,
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
      title={isEditing ? 'Редактировать анализ' : 'Добавить результат анализа'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Дата анализа *"
            type="date"
            error={errors.test_date?.message}
            {...register('test_date', { required: 'Дата обязательна' })}
          />
          <Input
            label="Лаборатория"
            placeholder="INVITRO, Helix..."
            {...register('lab_name')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Показатель *</label>
            <input
              list="markers"
              placeholder="Выберите или введите"
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              {...register('marker_name', { required: 'Показатель обязателен' })}
            />
            <datalist id="markers">
              {commonMarkers.map((m) => (
                <option key={m.value} value={m.value} />
              ))}
            </datalist>
            {errors.marker_name && (
              <p className="text-xs text-red-500">{errors.marker_name.message}</p>
            )}
          </div>
          <Select
            label="Категория"
            options={categoryOptions}
            placeholder="Выберите категорию"
            {...register('category')}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Значение"
            type="number"
            step="any"
            placeholder="5.5"
            {...register('value')}
          />
          <Input
            label="Единицы"
            placeholder="нг/мл"
            {...register('unit')}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Мин"
              type="number"
              step="any"
              placeholder="2.0"
              {...register('reference_min')}
            />
            <Input
              label="Макс"
              type="number"
              step="any"
              placeholder="10.0"
              {...register('reference_max')}
            />
          </div>
        </div>

        <Input
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
