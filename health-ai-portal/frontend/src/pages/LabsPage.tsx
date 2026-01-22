import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { labsApi } from '@/api/client'
import { Card } from '@/components/common/Card'
import { Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function LabsPage() {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)

  const { data: labs, isLoading } = useQuery({
    queryKey: ['labs'],
    queryFn: () => labsApi.list(),
  })

  const { data: trends } = useQuery({
    queryKey: ['labs', 'trends'],
    queryFn: labsApi.getTrends,
  })

  // Group labs by date
  const labsByDate = labs?.reduce((acc, lab) => {
    const date = lab.test_date.split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(lab)
    return acc
  }, {} as Record<string, typeof labs>)

  const getStatus = (value: number | null, min: number | null, max: number | null) => {
    if (value === null) return 'unknown'
    if (min !== null && value < min) return 'low'
    if (max !== null && value > max) return 'high'
    return 'normal'
  }

  const statusStyles = {
    low: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: TrendingDown },
    high: { bg: 'bg-red-500/10', text: 'text-red-500', icon: TrendingUp },
    normal: { bg: 'bg-green-500/10', text: 'text-green-500', icon: Minus },
    unknown: { bg: 'bg-gray-500/10', text: 'text-gray-500', icon: Minus },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Анализы</h1>
          <p className="text-muted-foreground">История лабораторных исследований</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Добавить результаты
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Results list */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : labsByDate && Object.keys(labsByDate).length > 0 ? (
            Object.entries(labsByDate)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, results]) => (
                <Card key={date} title={format(new Date(date), 'dd.MM.yyyy')}>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {results?.map((lab) => {
                      const status = getStatus(lab.value, lab.reference_min, lab.reference_max)
                      const style = statusStyles[status]
                      const Icon = style.icon
                      return (
                        <div
                          key={lab.id}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg cursor-pointer',
                            style.bg
                          )}
                          onClick={() => setSelectedMarker(lab.marker_name)}
                        >
                          <div>
                            <p className="font-medium text-sm">{lab.marker_name}</p>
                            {lab.reference_min !== null && lab.reference_max !== null && (
                              <p className="text-xs text-muted-foreground">
                                Норма: {lab.reference_min} - {lab.reference_max}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn('font-bold', style.text)}>
                              {lab.value} {lab.unit}
                            </span>
                            <Icon className={cn('h-4 w-4', style.text)} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              ))
          ) : (
            <Card className="py-12 text-center">
              <p className="text-muted-foreground">Нет результатов анализов</p>
              <p className="text-sm text-muted-foreground mt-1">
                Добавьте первые результаты для отслеживания динамики
              </p>
            </Card>
          )}
        </div>

        {/* Required labs */}
        <div className="space-y-4">
          <Card title="Требуется сдать" description="Обязательные анализы">
            <div className="space-y-2">
              {[
                { name: 'Лептин', urgent: true },
                { name: 'fT3, fT4, ТТГ', urgent: true },
                { name: 'Кортизол утром', urgent: true },
                { name: 'АКТГ', urgent: true },
                { name: 'IGF-1', urgent: false },
                { name: 'Тестостерон общий', urgent: false },
                { name: 'SHBG', urgent: false },
                { name: 'Эстрадиол', urgent: false },
                { name: 'АЛТ, АСТ, ГГТ', urgent: false },
                { name: 'H. pylori', urgent: false },
              ].map((lab) => (
                <div
                  key={lab.name}
                  className={cn(
                    'flex items-center justify-between p-2 rounded',
                    lab.urgent ? 'bg-red-500/10' : 'bg-muted/50'
                  )}
                >
                  <span className="text-sm">{lab.name}</span>
                  {lab.urgent && (
                    <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                      СРОЧНО
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card title="Тренды" description="Динамика показателей">
            <div className="space-y-3">
              {trends?.slice(0, 5).map((trend) => (
                <div key={trend.marker_name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{trend.marker_name}</span>
                    <span className="font-medium">
                      {trend.data_points[trend.data_points.length - 1]?.value} {trend.unit}
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-primary rounded-full" />
                  </div>
                </div>
              ))}
              {(!trends || trends.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Недостаточно данных для трендов
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
