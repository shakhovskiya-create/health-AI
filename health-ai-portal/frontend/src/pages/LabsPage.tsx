import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { labsApi } from '@/api/client'
import { Card } from '@/components/common/Card'
import { LabForm } from '@/components/labs/LabForm'
import { LabImport } from '@/components/labs/LabImport'
import { SingleMarkerChart, MarkerSelector } from '@/components/labs/LabChart'
import { ConfirmDialog } from '@/components/common/Modal'
import { Plus, TrendingUp, TrendingDown, Minus, Pencil, Trash2, LineChart, X, Upload } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { LabResult } from '@/types'

export default function LabsPage() {
  const queryClient = useQueryClient()
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLab, setEditingLab] = useState<LabResult | null>(null)
  const [deletingLab, setDeletingLab] = useState<LabResult | null>(null)
  const [showCharts, setShowCharts] = useState(false)
  const [chartMarkers, setChartMarkers] = useState<string[]>([])
  const [isImportOpen, setIsImportOpen] = useState(false)

  const { data: labs, isLoading } = useQuery({
    queryKey: ['labs'],
    queryFn: () => labsApi.list(),
  })

  const { data: trends } = useQuery({
    queryKey: ['labs', 'trends'],
    queryFn: labsApi.getTrends,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => labsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] })
      setDeletingLab(null)
    },
  })

  // Group labs by date
  const labsByDate = labs?.reduce((acc, lab) => {
    const date = lab.test_date.split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(lab)
    return acc
  }, {} as Record<string, typeof labs>)

  // Get unique markers for chart selection
  const availableMarkers = useMemo(() => {
    const markers = new Set<string>()
    labs?.forEach((lab) => markers.add(lab.marker_name))
    return Array.from(markers).sort()
  }, [labs])

  // Get data for selected marker
  const selectedMarkerData = useMemo(() => {
    if (!selectedMarker || !labs) return []
    return labs.filter((lab) => lab.marker_name === selectedMarker)
  }, [selectedMarker, labs])

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

  const handleEdit = (lab: LabResult) => {
    setEditingLab(lab)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingLab(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Анализы</h1>
          <p className="text-muted-foreground">История лабораторных исследований</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              showCharts
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <LineChart className="h-4 w-4" />
            Графики
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
          >
            <Upload className="h-4 w-4" />
            Импорт
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Добавить
          </button>
        </div>
      </div>

      {/* Charts Section */}
      {showCharts && (
        <Card title="Графики трендов" description="Динамика показателей по времени">
          <div className="space-y-4">
            <MarkerSelector
              markers={availableMarkers}
              selected={chartMarkers}
              onChange={setChartMarkers}
            />
            {chartMarkers.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {chartMarkers.map((marker) => {
                  const markerLabs = labs?.filter((l) => l.marker_name === marker) || []
                  return (
                    <div key={marker} className="p-4 border border-border rounded-lg">
                      <SingleMarkerChart markerName={marker} data={markerLabs} />
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Выберите показатели для отображения графиков
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Selected Marker Detail */}
      {selectedMarker && selectedMarkerData.length > 0 && (
        <Card className="relative">
          <button
            onClick={() => setSelectedMarker(null)}
            className="absolute top-4 right-4 p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="p-4">
            <SingleMarkerChart markerName={selectedMarker} data={selectedMarkerData} height={200} />
          </div>
        </Card>
      )}

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
                            'flex items-center justify-between p-3 rounded-lg cursor-pointer group relative',
                            style.bg
                          )}
                          onClick={() => setSelectedMarker(lab.marker_name)}
                        >
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(lab)
                              }}
                              className="p-1 rounded bg-background/80 hover:bg-background transition-colors"
                              title="Редактировать"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeletingLab(lab)
                              }}
                              className="p-1 rounded bg-background/80 hover:bg-red-500/20 text-red-500 transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
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
                <div
                  key={trend.marker_name}
                  className="space-y-1 cursor-pointer hover:bg-muted/50 p-2 rounded -mx-2 transition-colors"
                  onClick={() => setSelectedMarker(trend.marker_name)}
                >
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

      {/* Form Modal */}
      <LabForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        labResult={editingLab}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingLab}
        onClose={() => setDeletingLab(null)}
        onConfirm={() => deletingLab && deleteMutation.mutate(deletingLab.id)}
        title="Удалить результат анализа?"
        description={`Вы уверены, что хотите удалить результат "${deletingLab?.marker_name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        isLoading={deleteMutation.isPending}
      />

      {/* Import Modal */}
      <LabImport isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </div>
  )
}
