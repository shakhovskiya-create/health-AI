import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { cyclesApi, aiApi } from '@/api/client'
import { Modal } from '@/components/common/Modal'
import { Input, Textarea, Checkbox } from '@/components/common/Input'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Loader2, Brain, CheckCircle } from 'lucide-react'
import type { CycleInputData, AIAnalyzeResponse } from '@/types'

interface NewCycleWizardProps {
  isOpen: boolean
  onClose: () => void
}

type WizardStep = 'wellbeing' | 'training' | 'nutrition' | 'metrics' | 'request' | 'analyzing' | 'complete'

const steps: { id: WizardStep; title: string }[] = [
  { id: 'wellbeing', title: 'Самочувствие' },
  { id: 'training', title: 'Тренировки' },
  { id: 'nutrition', title: 'Питание' },
  { id: 'metrics', title: 'Метрики' },
  { id: 'request', title: 'Запрос' },
]

const defaultValues: CycleInputData = {
  goals: '',
  wellbeing: {
    sleep: '',
    energy: '',
    cognitive_clarity: '',
    libido: '',
    skin: '',
    gi: '',
    blood_pressure: '',
    other: '',
  },
  training: {
    frequency: '',
    split: '',
    exercises: '',
    steps: 5000,
    cardio: '',
  },
  nutrition: {
    calories: 2500,
    protein: 200,
    carbs: 200,
    fats: 80,
    if: false,
    caffeine: false,
    alcohol: false,
  },
  metrics: {
    weight: 0,
    blood_pressure: '',
    pulse: 0,
    hrv: 0,
    glucose: 0,
  },
  changes: '',
  ai_request: '',
}

export function NewCycleWizard({ isOpen, onClose }: NewCycleWizardProps) {
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState<WizardStep>('wellbeing')
  const [cycleId, setCycleId] = useState<number | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AIAnalyzeResponse | null>(null)

  const { register, handleSubmit, reset } = useForm<CycleInputData>({
    defaultValues,
  })

  const createCycleMutation = useMutation({
    mutationFn: (data: Partial<CycleInputData>) =>
      cyclesApi.create({
        cycle_date: new Date().toISOString(),
        cycle_type: 'full',
        input_data: data as Record<string, unknown>,
      }),
    onSuccess: (cycle) => {
      setCycleId(cycle.id)
      queryClient.invalidateQueries({ queryKey: ['cycles'] })
    },
  })

  const analyzeMutation = useMutation({
    mutationFn: async ({ inputData, cycleId }: { inputData: string; cycleId: number }) => {
      // Run AI analysis with cycle_id so backend saves results
      const result = await aiApi.analyze({
        input_data: inputData,
        role: 'full',
        cycle_id: cycleId,
      })

      // Determine verdict based on meta_supervisor output
      const metaContent = result.results.meta_supervisor?.content || ''
      let verdict: 'go' | 'wait' | 'stop' = 'wait'
      if (metaContent.includes('🟢') || metaContent.toLowerCase().includes('допустимо')) {
        verdict = 'go'
      } else if (metaContent.includes('🔴') || metaContent.toLowerCase().includes('недопустимо') || metaContent.toLowerCase().includes('стоп')) {
        verdict = 'stop'
      }

      // Update cycle with AI outputs and verdict
      await cyclesApi.update(cycleId, {
        master_curator_output: result.results.master_curator?.content,
        red_team_output: result.results.red_team?.content,
        meta_supervisor_output: result.results.meta_supervisor?.content,
        verdict,
      })

      return result
    },
    onSuccess: (result) => {
      setAnalysisResult(result)
      setCurrentStep('complete')
      queryClient.invalidateQueries({ queryKey: ['cycles'] })
    },
    onError: () => {
      setCurrentStep('request')
    },
  })

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  const goNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id)
    }
  }

  const goPrev = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
    }
  }

  const formatInputDataForAI = (data: CycleInputData): string => {
    return `# ВХОДНЫЕ ДАННЫЕ ЦИКЛА

## Дата цикла
${new Date().toISOString().split('T')[0]}

## Цели
${data.goals || 'БЕЗ ИЗМЕНЕНИЙ'}

## Самочувствие (7–14 дней)
- Сон: ${data.wellbeing.sleep || 'N/A'}
- Энергия: ${data.wellbeing.energy || 'N/A'}
- Когнитивная ясность: ${data.wellbeing.cognitive_clarity || 'N/A'}
- Либидо: ${data.wellbeing.libido || 'N/A'}
- Кожа: ${data.wellbeing.skin || 'N/A'}
- ЖКТ: ${data.wellbeing.gi || 'N/A'}
- Давление: ${data.wellbeing.blood_pressure || 'N/A'}
- Прочее: ${data.wellbeing.other || 'N/A'}

## Тренировки
- Частота: ${data.training.frequency || 'N/A'}
- Сплит: ${data.training.split || 'N/A'}
- Ключевые упражнения: ${data.training.exercises || 'N/A'}
- Шаги: ${data.training.steps}
- Кардио: ${data.training.cardio || 'нет'}

## Питание
- Калории: ${data.nutrition.calories}
- Белок: ${data.nutrition.protein}
- Углеводы: ${data.nutrition.carbs}
- Жиры: ${data.nutrition.fats}
- IF: ${data.nutrition.if ? 'да' : 'нет'}
- Кофеин: ${data.nutrition.caffeine ? 'да' : 'нет'}
- Алкоголь: ${data.nutrition.alcohol ? 'да' : 'нет'}

## Метрики
- Вес: ${data.metrics.weight || 'UNKNOWN'} кг
- Давление: ${data.metrics.blood_pressure || 'UNKNOWN'}
- Пульс: ${data.metrics.pulse || 'UNKNOWN'}
- HRV: ${data.metrics.hrv || 'UNKNOWN'}
- Глюкоза: ${data.metrics.glucose || 'UNKNOWN'}

## Что изменилось с прошлого цикла
${data.changes || 'Существенных изменений нет'}

## Запрос к ИИ
${data.ai_request || 'Полный анализ текущего состояния'}`
  }

  const onSubmit = async (data: CycleInputData) => {
    setCurrentStep('analyzing')

    // Create cycle first
    const cycle = await createCycleMutation.mutateAsync(data)

    // Then run AI analysis with cycle ID
    const inputDataStr = formatInputDataForAI(data)
    analyzeMutation.mutate({ inputData: inputDataStr, cycleId: cycle.id })
  }

  const handleClose = () => {
    reset(defaultValues)
    setCurrentStep('wellbeing')
    setCycleId(null)
    setAnalysisResult(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Новый цикл анализа"
      size="lg"
    >
      {/* Progress bar */}
      {currentStep !== 'analyzing' && currentStep !== 'complete' && (
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium',
                  index <= currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="h-1 bg-muted rounded-full">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-center mt-2 text-muted-foreground">
            {steps[currentStepIndex]?.title}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Wellbeing */}
        {currentStep === 'wellbeing' && (
          <div className="space-y-4">
            <Textarea
              label="Сон"
              placeholder="Качество, длительность, глубокий сон..."
              {...register('wellbeing.sleep')}
            />
            <Textarea
              label="Энергия"
              placeholder="Уровень энергии в течение дня..."
              {...register('wellbeing.energy')}
            />
            <Textarea
              label="Когнитивная ясность"
              placeholder="Концентрация, память, фокус..."
              {...register('wellbeing.cognitive_clarity')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Либидо"
                placeholder="Норма / снижено / повышено"
                {...register('wellbeing.libido')}
              />
              <Input
                label="Давление"
                placeholder="Стабильное / скачки"
                {...register('wellbeing.blood_pressure')}
              />
            </div>
            <Textarea
              label="Кожа"
              placeholder="Состояние кожи, высыпания..."
              {...register('wellbeing.skin')}
            />
            <Textarea
              label="ЖКТ"
              placeholder="Пищеварение, аппетит..."
              {...register('wellbeing.gi')}
            />
            <Textarea
              label="Прочее"
              placeholder="Другие симптомы или наблюдения..."
              {...register('wellbeing.other')}
            />
          </div>
        )}

        {/* Step 2: Training */}
        {currentStep === 'training' && (
          <div className="space-y-4">
            <Input
              label="Частота тренировок"
              placeholder="Например: 3 раза в неделю"
              {...register('training.frequency')}
            />
            <Input
              label="Сплит"
              placeholder="Например: Push/Pull/Legs"
              {...register('training.split')}
            />
            <Textarea
              label="Ключевые упражнения"
              placeholder="Основные упражнения в программе..."
              {...register('training.exercises')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Шаги в день"
                type="number"
                {...register('training.steps', { valueAsNumber: true })}
              />
              <Input
                label="Кардио"
                placeholder="Тип и частота"
                {...register('training.cardio')}
              />
            </div>
          </div>
        )}

        {/* Step 3: Nutrition */}
        {currentStep === 'nutrition' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Калории"
                type="number"
                {...register('nutrition.calories', { valueAsNumber: true })}
              />
              <Input
                label="Белок (г)"
                type="number"
                {...register('nutrition.protein', { valueAsNumber: true })}
              />
              <Input
                label="Углеводы (г)"
                type="number"
                {...register('nutrition.carbs', { valueAsNumber: true })}
              />
              <Input
                label="Жиры (г)"
                type="number"
                {...register('nutrition.fats', { valueAsNumber: true })}
              />
            </div>
            <div className="flex gap-6 pt-2">
              <Checkbox
                label="Интервальное голодание (IF)"
                {...register('nutrition.if')}
              />
              <Checkbox
                label="Кофеин"
                {...register('nutrition.caffeine')}
              />
              <Checkbox
                label="Алкоголь"
                {...register('nutrition.alcohol')}
              />
            </div>
          </div>
        )}

        {/* Step 4: Metrics */}
        {currentStep === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Вес (кг)"
                type="number"
                step="0.1"
                {...register('metrics.weight', { valueAsNumber: true })}
              />
              <Input
                label="Давление"
                placeholder="120/80"
                {...register('metrics.blood_pressure')}
              />
              <Input
                label="Пульс покоя"
                type="number"
                {...register('metrics.pulse', { valueAsNumber: true })}
              />
              <Input
                label="HRV"
                type="number"
                {...register('metrics.hrv', { valueAsNumber: true })}
              />
              <Input
                label="Глюкоза натощак"
                type="number"
                step="0.1"
                {...register('metrics.glucose', { valueAsNumber: true })}
              />
            </div>
          </div>
        )}

        {/* Step 5: Request */}
        {currentStep === 'request' && (
          <div className="space-y-4">
            <Textarea
              label="Цели (если изменились)"
              placeholder="Текущие цели или 'БЕЗ ИЗМЕНЕНИЙ'"
              {...register('goals')}
            />
            <Textarea
              label="Что изменилось с прошлого цикла"
              placeholder="Основные изменения..."
              {...register('changes')}
            />
            <Textarea
              label="Запрос к ИИ"
              placeholder="Что хотите узнать или проанализировать..."
              {...register('ai_request')}
              rows={4}
            />
          </div>
        )}

        {/* Analyzing state */}
        {currentStep === 'analyzing' && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">Анализ данных...</h3>
            <p className="text-sm text-muted-foreground mb-4">
              AI анализирует ваши данные. Это может занять несколько минут.
            </p>
            <div className="space-y-2 text-left max-w-xs mx-auto">
              <div className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-blue-500" />
                <span>Master Curator анализирует...</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="h-4 w-4" />
                <span>Red Team ожидает...</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="h-4 w-4" />
                <span>Meta-Supervisor ожидает...</span>
              </div>
            </div>
          </div>
        )}

        {/* Complete state */}
        {currentStep === 'complete' && analysisResult && (
          <div className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Анализ завершён!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Цикл #{cycleId} создан. Результаты сохранены.
            </p>
            <div className="space-y-2 text-left">
              {analysisResult.results.master_curator && (
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-sm font-medium text-blue-500">Master Curator</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analysisResult.results.master_curator.content.slice(0, 150)}...
                  </p>
                </div>
              )}
              {analysisResult.results.red_team && (
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <p className="text-sm font-medium text-red-500">Red Team</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analysisResult.results.red_team.content.slice(0, 150)}...
                  </p>
                </div>
              )}
              {analysisResult.results.meta_supervisor && (
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-sm font-medium text-green-500">Meta-Supervisor</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analysisResult.results.meta_supervisor.content.slice(0, 150)}...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-border">
          {currentStep !== 'analyzing' && currentStep !== 'complete' && (
            <>
              <button
                type="button"
                onClick={currentStepIndex === 0 ? handleClose : goPrev}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm rounded-md hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStepIndex === 0 ? 'Отмена' : 'Назад'}
              </button>
              {currentStepIndex < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Далее
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={analyzeMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Brain className="h-4 w-4" />
                  Запустить анализ
                </button>
              )}
            </>
          )}
          {currentStep === 'complete' && (
            <button
              type="button"
              onClick={handleClose}
              className="w-full px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Закрыть и посмотреть результаты
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
