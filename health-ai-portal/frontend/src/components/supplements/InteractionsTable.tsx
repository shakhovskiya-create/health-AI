import { useMemo, useState } from 'react'
import { AlertTriangle, AlertCircle, Sparkles, ChevronDown, ChevronUp, Filter } from 'lucide-react'
import type { Interaction, Supplement } from '@/types'

interface InteractionsTableProps {
  interactions: Interaction[]
  supplements?: Supplement[]
  onEdit?: (interaction: Interaction) => void
  onDelete?: (interaction: Interaction) => void
}

const interactionTypeConfig = {
  critical: {
    label: 'Критическое',
    icon: AlertTriangle,
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-500',
    borderColor: 'border-red-500/20',
  },
  warning: {
    label: 'Предупреждение',
    icon: AlertCircle,
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-500',
    borderColor: 'border-yellow-500/20',
  },
  synergy: {
    label: 'Синергия',
    icon: Sparkles,
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-500',
    borderColor: 'border-green-500/20',
  },
}

export function InteractionsTable({
  interactions,
  supplements,
  onEdit,
  onDelete,
}: InteractionsTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)

  const filteredInteractions = useMemo(() => {
    if (!filterType) return interactions
    return interactions.filter((i) => i.interaction_type === filterType)
  }, [interactions, filterType])

  const sortedInteractions = useMemo(() => {
    return [...filteredInteractions].sort((a, b) => {
      const order = { critical: 0, warning: 1, synergy: 2 }
      const aOrder = order[a.interaction_type as keyof typeof order] ?? 3
      const bOrder = order[b.interaction_type as keyof typeof order] ?? 3
      return aOrder - bOrder
    })
  }, [filteredInteractions])

  const stats = useMemo(() => {
    return {
      critical: interactions.filter((i) => i.interaction_type === 'critical').length,
      warning: interactions.filter((i) => i.interaction_type === 'warning').length,
      synergy: interactions.filter((i) => i.interaction_type === 'synergy').length,
    }
  }, [interactions])

  if (interactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Взаимодействия не найдены</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setFilterType(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterType === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Все ({interactions.length})
        </button>
        {Object.entries(stats).map(([type, count]) => {
          const config = interactionTypeConfig[type as keyof typeof interactionTypeConfig]
          if (!config || count === 0) return null
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? null : type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filterType === type
                  ? `${config.bgColor} ${config.textColor}`
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <config.icon className="h-4 w-4" />
              {config.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Тип</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Препарат 1</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Препарат 2</th>
              <th className="text-left px-4 py-3 text-sm font-medium hidden md:table-cell">
                Описание
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedInteractions.map((interaction) => {
              const config = interaction.interaction_type
                ? interactionTypeConfig[interaction.interaction_type]
                : null
              const isExpanded = expandedId === interaction.id

              return (
                <>
                  <tr
                    key={interaction.id}
                    className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                      config ? config.bgColor : ''
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : interaction.id)}
                  >
                    <td className="px-4 py-3">
                      {config && (
                        <div className="flex items-center gap-2">
                          <config.icon className={`h-4 w-4 ${config.textColor}`} />
                          <span className={`text-sm font-medium ${config.textColor}`}>
                            {config.label}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {interaction.supplement_1_name || `ID: ${interaction.supplement_1_id}`}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {interaction.supplement_2_name || `ID: ${interaction.supplement_2_id}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      <span className="line-clamp-1">
                        {interaction.description || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${interaction.id}-expanded`}>
                      <td colSpan={5} className="bg-muted/20 px-4 py-4">
                        <div className="space-y-3">
                          {interaction.description && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Описание</h4>
                              <p className="text-sm text-muted-foreground">
                                {interaction.description}
                              </p>
                            </div>
                          )}
                          {interaction.solution && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Решение</h4>
                              <p className="text-sm text-muted-foreground">
                                {interaction.solution}
                              </p>
                            </div>
                          )}
                          {(onEdit || onDelete) && (
                            <div className="flex gap-2 pt-2">
                              {onEdit && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit(interaction)
                                  }}
                                  className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded transition-colors"
                                >
                                  Редактировать
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(interaction)
                                  }}
                                  className="px-3 py-1 text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded transition-colors"
                                >
                                  Удалить
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface InteractionMatrixProps {
  interactions: Interaction[]
  supplements: Supplement[]
}

export function InteractionMatrix({ interactions, supplements }: InteractionMatrixProps) {
  const matrix = useMemo(() => {
    const map = new Map<string, Interaction>()
    interactions.forEach((i) => {
      const key1 = `${i.supplement_1_id}-${i.supplement_2_id}`
      const key2 = `${i.supplement_2_id}-${i.supplement_1_id}`
      map.set(key1, i)
      map.set(key2, i)
    })
    return map
  }, [interactions])

  const activeSupplements = supplements.filter((s) => s.status === 'active')

  if (activeSupplements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет активных препаратов
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            <th className="p-2 sticky left-0 bg-background"></th>
            {activeSupplements.map((s) => (
              <th
                key={s.id}
                className="p-2 text-center font-medium truncate max-w-[80px]"
                title={s.name}
              >
                {s.name.slice(0, 8)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeSupplements.map((row) => (
            <tr key={row.id}>
              <td
                className="p-2 font-medium sticky left-0 bg-background truncate max-w-[100px]"
                title={row.name}
              >
                {row.name.slice(0, 12)}
              </td>
              {activeSupplements.map((col) => {
                if (row.id === col.id) {
                  return (
                    <td key={col.id} className="p-2 text-center bg-muted/30">
                      —
                    </td>
                  )
                }
                const interaction = matrix.get(`${row.id}-${col.id}`)
                if (!interaction) {
                  return (
                    <td key={col.id} className="p-2 text-center">
                      <span className="text-muted-foreground/50">·</span>
                    </td>
                  )
                }
                const config = interaction.interaction_type
                  ? interactionTypeConfig[interaction.interaction_type]
                  : null
                return (
                  <td
                    key={col.id}
                    className={`p-2 text-center cursor-pointer ${config?.bgColor || ''}`}
                    title={interaction.description || undefined}
                  >
                    {config && <config.icon className={`h-4 w-4 mx-auto ${config.textColor}`} />}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
