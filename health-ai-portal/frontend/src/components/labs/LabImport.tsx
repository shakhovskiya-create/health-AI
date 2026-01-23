import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Trash2, Check, AlertCircle, Brain, Loader2, Upload, FileText, X } from 'lucide-react'
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

type ImportStep = 'input' | 'parsing' | 'review' | 'importing' | 'complete'
type InputMethod = 'file' | 'text'

export function LabImport({ isOpen, onClose }: LabImportProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<ImportStep>('input')
  const [inputMethod, setInputMethod] = useState<InputMethod>('file')
  const [labName, setLabName] = useState('')
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const [rawText, setRawText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [markers, setMarkers] = useState<ImportMarker[]>([])
  const [importResult, setImportResult] = useState<{ imported: number; total: number } | null>(null)
  const [parseError, setParseError] = useState('')

  const parseMutation = useMutation({
    mutationFn: (data: { text: string; lab_name: string; test_date: string }) =>
      api.post('/ai/parse-labs', data).then((r) => r.data),
    onSuccess: (result) => {
      if (result.markers && result.markers.length > 0) {
        setMarkers(
          result.markers.map((m: Omit<ImportMarker, 'id'>) => ({
            ...m,
            id: crypto.randomUUID(),
          }))
        )
        setStep('review')
        setParseError('')
      } else {
        setParseError('Не удалось распознать показатели. Попробуйте другой формат.')
        setStep('input')
      }
    },
    onError: () => {
      setParseError('Ошибка AI парсинга. Проверьте подключение и API ключ.')
      setStep('input')
    },
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('lab_name', labName)
      formData.append('test_date', testDate)
      return api.post('/ai/parse-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then((r) => r.data)
    },
    onSuccess: (result) => {
      if (result.markers && result.markers.length > 0) {
        setMarkers(
          result.markers.map((m: Omit<ImportMarker, 'id'>) => ({
            ...m,
            id: crypto.randomUUID(),
          }))
        )
        setStep('review')
        setParseError('')
      } else {
        setParseError('Не удалось распознать показатели из PDF. Попробуйте текстовый ввод.')
        setStep('input')
      }
    },
    onError: () => {
      setParseError('Ошибка обработки PDF. Попробуйте текстовый ввод.')
      setStep('input')
    },
  })

  const importMutation = useMutation({
    mutationFn: (data: { lab_name: string; test_date: string; markers: Omit<ImportMarker, 'id'>[] }) =>
      api.post('/labs/import', data).then((r) => r.data),
    onSuccess: (result) => {
      setImportResult(result)
      setStep('complete')
      queryClient.invalidateQueries({ queryKey: ['labs'] })
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file)
        setParseError('')
      } else {
        setParseError('Пожалуйста, выберите PDF файл')
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file)
        setParseError('')
      } else {
        setParseError('Пожалуйста, выберите PDF файл')
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleParse = () => {
    if (inputMethod === 'file') {
      if (!selectedFile) {
        setParseError('Выберите PDF файл')
        return
      }
      setStep('parsing')
      setParseError('')
      uploadMutation.mutate(selectedFile)
    } else {
      if (!rawText.trim()) {
        setParseError('Вставьте текст анализов')
        return
      }
      setStep('parsing')
      setParseError('')
      parseMutation.mutate({
        text: rawText,
        lab_name: labName,
        test_date: testDate,
      })
    }
  }

  const updateMarker = (id: string, updates: Partial<ImportMarker>) => {
    setMarkers(markers.map((m) => (m.id === id ? { ...m, ...updates } : m)))
  }

  const removeMarker = (id: string) => {
    setMarkers(markers.filter((m) => m.id !== id))
  }

  const handleImport = () => {
    const validMarkers = markers.filter((m) => m.marker_name && m.value !== null)
    if (validMarkers.length === 0) return

    setStep('importing')
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
    setRawText('')
    setSelectedFile(null)
    setStep('input')
    setInputMethod('file')
    setImportResult(null)
    setParseError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Импорт анализов с AI" size="lg">
      {/* Step: Input */}
      {step === 'input' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Лаборатория"
              placeholder="INVITRO, Helix, Гемотест..."
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

          {/* Input method tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setInputMethod('file')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                inputMethod === 'file'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="inline-block h-4 w-4 mr-2" />
              Загрузить PDF
            </button>
            <button
              onClick={() => setInputMethod('text')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                inputMethod === 'text'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="inline-block h-4 w-4 mr-2" />
              Вставить текст
            </button>
          </div>

          {/* File upload */}
          {inputMethod === 'file' && (
            <div className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  selectedFile
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="h-12 w-12 mx-auto text-primary" />
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedFile(null)
                        }}
                        className="p-1 rounded-full hover:bg-destructive/20 text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Перетащите PDF или нажмите для выбора
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Поддерживаются файлы PDF с результатами анализов
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Text input */}
          {inputMethod === 'text' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Текст анализов</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Скопируйте и вставьте сюда текст из PDF или результатов анализов...

Например:
Тестостерон общий: 25.5 нмоль/л (8.64-29.0)
ТТГ: 2.1 мкМЕ/мл (0.4-4.0)
Глюкоза: 5.2 ммоль/л (3.9-6.1)
АЛТ: 32 Ед/л (0-41)
..."
                rows={10}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
            </div>
          )}

          {parseError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{parseError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm rounded-md hover:bg-muted transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleParse}
              disabled={inputMethod === 'file' ? !selectedFile : !rawText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Brain className="h-4 w-4" />
              Распознать с AI
            </button>
          </div>
        </div>
      )}

      {/* Step: Parsing */}
      {step === 'parsing' && (
        <div className="py-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <h3 className="text-lg font-medium mb-2">AI анализирует {inputMethod === 'file' ? 'PDF' : 'текст'}...</h3>
          <p className="text-sm text-muted-foreground">
            Claude извлекает показатели из {inputMethod === 'file' ? 'документа' : 'текста'}
          </p>
        </div>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
            <Check className="h-4 w-4" />
            <span className="text-sm">Распознано {markers.length} показателей. Проверьте и отредактируйте.</span>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
                    className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep('input')}
              className="px-4 py-2 text-sm rounded-md hover:bg-muted transition-colors"
            >
              Назад
            </button>
            <button
              onClick={handleImport}
              disabled={markers.filter((m) => m.marker_name && m.value !== null).length === 0}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Сохранить ({markers.filter((m) => m.marker_name && m.value !== null).length})
            </button>
          </div>
        </div>
      )}

      {/* Step: Importing */}
      {step === 'importing' && (
        <div className="py-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <h3 className="text-lg font-medium">Сохранение...</h3>
        </div>
      )}

      {/* Step: Complete */}
      {step === 'complete' && importResult && (
        <div className="py-8 text-center">
          <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Импорт завершён!</h3>
          <p className="text-muted-foreground">
            Сохранено {importResult.imported} из {importResult.total} показателей
          </p>
          <button
            onClick={handleClose}
            className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Готово
          </button>
        </div>
      )}
    </Modal>
  )
}
