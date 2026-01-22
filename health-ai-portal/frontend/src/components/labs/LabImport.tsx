import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { cn } from '@/lib/utils'
import { Upload, Plus, Trash2, Check, AlertCircle } from 'lucide-react'
import api from '@/api/client'

interface LabImportProps {
  isOpen: boolean
  onClose: () => void
}

interface ImportMarker {
  id: string
  marker_name: string
  value: number | null
  unit: string
  reference_min: number | null
  reference_max: number | null
  category: string
}

const commonMarkers = [
  { name: 'Testosterone Total', unit: 'nmol/L', category: 'hormones' },
  { name: 'Estradiol', unit: 'pmol/L', category: 'hormones' },
  { name: 'TSH', unit: 'mIU/L', category: 'thyroid' },
  { name: 'fT3', unit: 'pmol/L', category: 'thyroid' },
  { name: 'fT4', unit: 'pmol/L', category: 'thyroid' },
  { name: 'LDL', unit: 'mmol/L', category: 'lipids' },
  { name: 'HDL', unit: 'mmol/L', category: 'lipids' },
  { name: 'Triglycerides', unit: 'mmol/L', category: 'lipids' },
  { name: 'ALT', unit: 'U/L', category: 'liver' },
  { name: 'AST', unit: 'U/L', category: 'liver' },
  { name: 'Glucose', unit: 'mmol/L', category: 'metabolism' },
  { name: 'HbA1c', unit: '%', category: 'metabolism' },
  { name: 'Creatinine', unit: 'umol/L', category: 'kidney' },
  { name: 'Vitamin D', unit: 'ng/mL', category: 'vitamins' },
  { name: 'Ferritin', unit: 'ng/mL', category: 'iron' },
  { name: 'CRP', unit: 'mg/L', category: 'inflammation' },
  { name: 'Hemoglobin', unit: 'g/L', category: 'blood' },
  { name: 'Hematocrit', unit: '%', category: 'blood' },
]

export function LabImport({ isOpen, onClose }: LabImportProps) {
  const queryClient = useQueryClient()
  const [labName, setLabName] = useState('')
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const [markers, setMarkers] = useState<ImportMarker[]>([])
  const [importResult, setImportResult] = useState<{ imported: number; total: number } | null>(null)

  const importMutation = useMutation({
    mutationFn: (data: { lab_name: string; test_date: string; markers: Omit<ImportMarker, 'id'>[] }) =>
      api.post('/labs/import', data).then((r) => r.data),
    onSuccess: (result) => {
      setImportResult(result)
      queryClient.invalidateQueries({ queryKey: ['labs'] })
    },
  })

  const addMarker = () => {
    setMarkers([
      ...markers,
      {
        id: crypto.randomUUID(),
        marker_name: '',
        value: null,
        unit: '',
        reference_min: null,
        reference_max: null,
        category: 'other',
      },
    ])
  }

  const addCommonMarker = (marker: typeof commonMarkers[0]) => {
    setMarkers([
      ...markers,
      {
        id: crypto.randomUUID(),
        marker_name: marker.name,
        value: null,
        unit: marker.unit,
        reference_min: null,
        reference_max: null,
        category: marker.category,
      },
    ])
  }

  const updateMarker = (id: string, updates: Partial<ImportMarker>) => {
    setMarkers(markers.map((m) => (m.id === id ? { ...m, ...updates } : m)))
  }

  const removeMarker = (id: string) => {
    setMarkers(markers.filter((m) => m.id !== id))
  }

  const handleSubmit = () => {
    const validMarkers = markers.filter((m) => m.marker_name && m.value !== null)
    if (validMarkers.length === 0) return

    importMutation.mutate({
      lab_name: labName,
      test_date: testDate,
      markers: validMarkers.map(({ id, ...rest }) => rest),
    })
  }

  const handleClose = () => {
    setMarkers([])
    setLabName('')
    setTestDate(new Date().toISOString().split('T')[0])
    setImportResult(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Импорт анализов" size="lg">
      {importResult ? (
        <div className="text-center py-8">
          <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Импорт завершён</h3>
          <p className="text-muted-foreground">
            Импортировано {importResult.imported} из {importResult.total} маркеров
          </p>
          <button
            onClick={handleClose}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Закрыть
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Lab info */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Лаборатория"
              placeholder="Например: INVITRO"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
            />
            <Input
              label="Дата анализа"
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
            />
          </div>

          {/* Quick add common markers */}
          <div>
            <p className="text-sm font-medium mb-2">Быстрое добавление</p>
            <div className="flex flex-wrap gap-1">
              {commonMarkers.map((marker) => (
                <button
                  key={marker.name}
                  onClick={() => addCommonMarker(marker)}
                  disabled={markers.some((m) => m.marker_name === marker.name)}
                  className={cn(
                    'px-2 py-1 text-xs rounded-md transition-colors',
                    markers.some((m) => m.marker_name === marker.name)
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  )}
                >
                  {marker.name}
                </button>
              ))}
            </div>
          </div>

          {/* Markers list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Маркеры ({markers.length})</p>
              <button
                onClick={addMarker}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary/10 text-primary hover:bg-primary/20"
              >
                <Plus className="h-3 w-3" />
                Добавить
              </button>
            </div>

            {markers.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-lg">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Добавьте маркеры с помощью кнопок выше
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {markers.map((marker) => (
                  <div
                    key={marker.id}
                    className="grid grid-cols-12 gap-2 p-2 bg-muted/50 rounded-lg items-end"
                  >
                    <div className="col-span-3">
                      <Input
                        label="Маркер"
                        value={marker.marker_name}
                        onChange={(e) => updateMarker(marker.id, { marker_name: e.target.value })}
                        placeholder="Название"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        label="Значение"
                        type="number"
                        step="0.01"
                        value={marker.value ?? ''}
                        onChange={(e) =>
                          updateMarker(marker.id, {
                            value: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        label="Ед."
                        value={marker.unit}
                        onChange={(e) => updateMarker(marker.id, { unit: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        label="Мин"
                        type="number"
                        step="0.01"
                        value={marker.reference_min ?? ''}
                        onChange={(e) =>
                          updateMarker(marker.id, {
                            reference_min: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        label="Макс"
                        type="number"
                        step="0.01"
                        value={marker.reference_max ?? ''}
                        onChange={(e) =>
                          updateMarker(marker.id, {
                            reference_max: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center pb-1">
                      <button
                        onClick={() => removeMarker(marker.id)}
                        className="p-1.5 rounded-md hover:bg-red-500/20 text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm rounded-md hover:bg-muted transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                markers.filter((m) => m.marker_name && m.value !== null).length === 0 ||
                importMutation.isPending
              }
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importMutation.isPending ? 'Импорт...' : `Импортировать (${markers.filter((m) => m.marker_name && m.value !== null).length})`}
            </button>
          </div>

          {importMutation.isError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-500 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Ошибка при импорте. Попробуйте снова.</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
