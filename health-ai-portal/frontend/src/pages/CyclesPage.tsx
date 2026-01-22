import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cyclesApi } from '@/api/client'
import { Card } from '@/components/common/Card'
import { NewCycleWizard } from '@/components/cycles/NewCycleWizard'
import { AIAnalysis } from '@/components/ai/AIAnalysis'
import { Modal } from '@/components/common/Modal'
import { Plus, CheckCircle, AlertCircle, XCircle, ChevronRight, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { Cycle } from '@/types'

const verdictStyles = {
  go: { bg: 'bg-green-500/10', border: 'border-green-500', icon: CheckCircle, text: 'text-green-500', label: 'МОЖНО' },
  wait: { bg: 'bg-yellow-500/10', border: 'border-yellow-500', icon: AlertCircle, text: 'text-yellow-500', label: 'ЖДЁМ' },
  stop: { bg: 'bg-red-500/10', border: 'border-red-500', icon: XCircle, text: 'text-red-500', label: 'СТОП' },
}

const cycleTypeLabels: Record<string, string> = {
  full: 'Полный',
  partial: 'Частичный',
  control: 'Контрольный',
}

export default function CyclesPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null)

  const { data: cycles, isLoading } = useQuery({
    queryKey: ['cycles'],
    queryFn: cyclesApi.list,
  })

  const getVerdictStyle = (verdict: string | null) => {
    if (!verdict || !verdictStyles[verdict as keyof typeof verdictStyles]) {
      return verdictStyles.wait
    }
    return verdictStyles[verdict as keyof typeof verdictStyles]
  }

  const hasAIAnalysis = (cycle: Cycle) => {
    return cycle.master_curator_output || cycle.red_team_output || cycle.meta_supervisor_output
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">История циклов</h1>
          <p className="text-muted-foreground">Аналитические циклы и решения</p>
        </div>
        <button
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Новый цикл
        </button>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : cycles && cycles.length > 0 ? (
        <div className="space-y-4">
          {cycles
            .sort((a, b) => new Date(b.cycle_date).getTime() - new Date(a.cycle_date).getTime())
            .map((cycle) => {
              const style = getVerdictStyle(cycle.verdict)
              const Icon = style.icon
              return (
                <Card
                  key={cycle.id}
                  className={cn(
                    'relative hover:border-primary/50 transition-colors cursor-pointer',
                    style.bg,
                    `border-l-4 ${style.border}`
                  )}
                  onClick={() => setSelectedCycle(cycle)}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('p-2 rounded-lg', style.bg)}>
                      <Icon className={cn('h-6 w-6', style.text)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          CYCLE-{String(cycle.id).padStart(4, '0')} — {cycleTypeLabels[cycle.cycle_type || 'full'] || 'Цикл'}
                        </h3>
                        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', style.bg, style.text)}>
                          {style.label}
                        </span>
                        {hasAIAnalysis(cycle) && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            AI
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {format(new Date(cycle.cycle_date), 'dd.MM.yyyy')}
                      </p>
                      {cycle.next_review_date && (
                        <p className="text-sm">
                          Следующий обзор: {format(new Date(cycle.next_review_date), 'dd.MM.yyyy')}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              )
            })}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">Нет циклов анализа</p>
          <p className="text-sm text-muted-foreground">
            Создайте первый цикл для AI-анализа вашего состояния
          </p>
        </Card>
      )}

      {/* Current protocol version */}
      <Card title="Текущий протокол" description="v12.0">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Всего циклов</p>
            <p className="text-2xl font-bold">{cycles?.length || 0}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">С AI анализом</p>
            <p className="text-2xl font-bold">
              {cycles?.filter(hasAIAnalysis).length || 0}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Последний цикл</p>
            <p className="text-2xl font-bold">
              {cycles && cycles.length > 0
                ? format(
                    new Date(
                      cycles.sort(
                        (a, b) =>
                          new Date(b.cycle_date).getTime() - new Date(a.cycle_date).getTime()
                      )[0].cycle_date
                    ),
                    'dd.MM'
                  )
                : '—'}
            </p>
          </div>
        </div>
      </Card>

      {/* New Cycle Wizard */}
      <NewCycleWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />

      {/* Cycle Detail Modal */}
      <Modal
        isOpen={!!selectedCycle}
        onClose={() => setSelectedCycle(null)}
        title={selectedCycle ? `CYCLE-${String(selectedCycle.id).padStart(4, '0')}` : ''}
        size="lg"
      >
        {selectedCycle && (
          <div className="space-y-6">
            {/* Cycle info */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Дата</p>
                <p className="font-medium">
                  {format(new Date(selectedCycle.cycle_date), 'dd.MM.yyyy')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Тип</p>
                <p className="font-medium">
                  {cycleTypeLabels[selectedCycle.cycle_type || 'full'] || 'Цикл'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Вердикт</p>
                <p className={cn('font-medium', getVerdictStyle(selectedCycle.verdict).text)}>
                  {getVerdictStyle(selectedCycle.verdict).label}
                </p>
              </div>
            </div>

            {/* AI Analysis */}
            {hasAIAnalysis(selectedCycle) ? (
              <AIAnalysis cycle={selectedCycle} />
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">AI анализ не выполнен для этого цикла</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
