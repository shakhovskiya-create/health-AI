import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supplementsApi } from '@/api/client'
import { Card } from '@/components/common/Card'
import { SupplementForm } from '@/components/supplements/SupplementForm'
import { ConfirmDialog } from '@/components/common/Modal'
import { Plus, Clock, Pill, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Supplement } from '@/types'

const categoryLabels: Record<string, string> = {
  morning: 'Утренний блок',
  day: 'Дневной блок',
  evening: 'Вечерний блок',
  course: 'Курсовые',
  hrt: 'ГЗТ',
  on_demand: 'По требованию',
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  removed: 'bg-red-500',
}

export default function SupplementsPage() {
  const queryClient = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null)
  const [deletingSupplement, setDeletingSupplement] = useState<Supplement | null>(null)

  const { data: byCategory, isLoading } = useQuery({
    queryKey: ['supplements', 'by-category'],
    queryFn: supplementsApi.getByCategory,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => supplementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] })
      setDeletingSupplement(null)
    },
  })

  const categories = byCategory ? Object.keys(byCategory) : []

  const handleEdit = (supplement: Supplement) => {
    setEditingSupplement(supplement)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingSupplement(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Стек препаратов</h1>
          <p className="text-muted-foreground">Управление вашим протоколом</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Добавить препарат
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {categoryLabels[cat] || cat}
            <span className="ml-1 text-xs opacity-70">
              ({byCategory?.[cat]?.length || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Supplements grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {(selectedCategory ? [selectedCategory] : categories).map((cat) => (
            <div key={cat}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Pill className="h-5 w-5" />
                {categoryLabels[cat] || cat}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {byCategory?.[cat]?.map((supp: Supplement) => (
                  <Card key={supp.id} className="p-4 group relative">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => handleEdit(supp)}
                        className="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                        title="Редактировать"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingSupplement(supp)}
                        className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium pr-16">{supp.name}</h3>
                      <div className={cn('w-2 h-2 rounded-full absolute top-4 right-4 group-hover:opacity-0', statusColors[supp.status])} />
                    </div>
                    {supp.dose && (
                      <p className="text-sm text-primary font-medium mb-1">{supp.dose}</p>
                    )}
                    {supp.time_of_day && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {supp.time_of_day}
                      </p>
                    )}
                    {supp.mechanism && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {supp.mechanism}
                      </p>
                    )}
                    {supp.target && (
                      <p className="text-xs text-blue-400 mt-1">
                        Цель: {supp.target}
                      </p>
                    )}
                    {supp.evidence_level && (
                      <span className={cn(
                        'inline-block mt-2 text-xs px-2 py-0.5 rounded',
                        supp.evidence_level === 'clinical' && 'bg-green-500/10 text-green-500',
                        supp.evidence_level === 'preclinical' && 'bg-yellow-500/10 text-yellow-500',
                        supp.evidence_level === 'theoretical' && 'bg-gray-500/10 text-gray-500'
                      )}>
                        {supp.evidence_level}
                      </span>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <SupplementForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        supplement={editingSupplement}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingSupplement}
        onClose={() => setDeletingSupplement(null)}
        onConfirm={() => deletingSupplement && deleteMutation.mutate(deletingSupplement.id)}
        title="Удалить препарат?"
        description={`Вы уверены, что хотите удалить "${deletingSupplement?.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
