import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { interactionsApi, supplementsApi } from '@/api/client'
import { Card } from '@/components/common/Card'
import { InteractionsTable, InteractionMatrix } from '@/components/supplements/InteractionsTable'
import { InteractionForm } from '@/components/supplements/InteractionForm'
import { ConfirmDialog } from '@/components/common/Modal'
import { Plus, Table, Grid3X3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Interaction } from '@/types'

export default function InteractionsPage() {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null)
  const [deletingInteraction, setDeletingInteraction] = useState<Interaction | null>(null)

  const { data: interactions, isLoading } = useQuery({
    queryKey: ['interactions'],
    queryFn: () => interactionsApi.list(),
  })

  const { data: supplements } = useQuery({
    queryKey: ['supplements', 'active'],
    queryFn: () => supplementsApi.list({ status: 'active' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => interactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] })
      setDeletingInteraction(null)
    },
  })

  const handleEdit = (interaction: Interaction) => {
    setEditingInteraction(interaction)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingInteraction(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Взаимодействия</h1>
          <p className="text-muted-foreground">Взаимодействия между препаратами</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-muted rounded-md p-1">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                viewMode === 'table'
                  ? 'bg-background shadow-sm'
                  : 'hover:bg-background/50'
              )}
            >
              <Table className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                viewMode === 'matrix'
                  ? 'bg-background shadow-sm'
                  : 'hover:bg-background/50'
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Добавить
          </button>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="p-6">
          <InteractionsTable
            interactions={interactions || []}
            supplements={supplements || []}
            onEdit={handleEdit}
            onDelete={setDeletingInteraction}
          />
        </Card>
      ) : (
        <Card title="Матрица взаимодействий" className="p-6">
          <InteractionMatrix
            interactions={interactions || []}
            supplements={supplements || []}
          />
        </Card>
      )}

      {/* Form Modal */}
      <InteractionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        interaction={editingInteraction}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingInteraction}
        onClose={() => setDeletingInteraction(null)}
        onConfirm={() => deletingInteraction && deleteMutation.mutate(deletingInteraction.id)}
        title="Удалить взаимодействие?"
        description="Вы уверены, что хотите удалить это взаимодействие? Это действие нельзя отменить."
        confirmText="Удалить"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
