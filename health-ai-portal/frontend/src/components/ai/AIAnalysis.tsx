import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { aiApi } from '@/api/client'
import { Card } from '@/components/common/Card'
import { cn } from '@/lib/utils'
import { Brain, Shield, Scale, Lightbulb, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Cycle } from '@/types'

interface AIAnalysisProps {
  cycle: Cycle
}

const roleConfig = {
  research_strategy_lead: {
    title: 'Research & Strategy Lead',
    description: 'Исследование, моделирование и стратегический синтез',
    icon: Lightbulb,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  master_curator: {
    title: 'Master Curator',
    description: 'Клинический анализ и рекомендации',
    icon: Brain,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  red_team: {
    title: 'Red Team',
    description: 'Аудит рисков и критический анализ',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  meta_supervisor: {
    title: 'Meta-Supervisor',
    description: 'Арбитраж и финальное решение',
    icon: Scale,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
}

type RoleKey = keyof typeof roleConfig

function RoleSection({ role, content }: { role: RoleKey; content: string }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const config = roleConfig[role]
  const Icon = config.icon

  return (
    <div className={cn('rounded-lg border', config.borderColor)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left',
          config.bgColor,
          'rounded-t-lg',
          !isExpanded && 'rounded-b-lg'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn('h-5 w-5', config.color)} />
          <div>
            <h3 className={cn('font-semibold', config.color)}>{config.title}</h3>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}

export function AIAnalysis({ cycle }: AIAnalysisProps) {
  const hasLocalData =
    cycle.rsl_output ||
    cycle.master_curator_output ||
    cycle.red_team_output ||
    cycle.meta_supervisor_output

  const { data: analysisData, isLoading } = useQuery({
    queryKey: ['ai-analysis', cycle.id],
    queryFn: () => aiApi.getAnalysis(cycle.id),
    enabled: !hasLocalData,
  })

  // Use local cycle data if available, otherwise use fetched data
  const rslContent =
    cycle.rsl_output ||
    analysisData?.results?.research_strategy_lead?.content
  const masterCuratorContent =
    cycle.master_curator_output ||
    analysisData?.results?.master_curator?.content
  const redTeamContent =
    cycle.red_team_output || analysisData?.results?.red_team?.content
  const metaSupervisorContent =
    cycle.meta_supervisor_output ||
    analysisData?.results?.meta_supervisor?.content

  if (isLoading && !hasLocalData) {
    return (
      <Card title="AI Анализ">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  if (!rslContent && !masterCuratorContent && !redTeamContent && !metaSupervisorContent) {
    return (
      <Card title="AI Анализ">
        <p className="text-center text-muted-foreground py-8">
          AI анализ ещё не выполнен для этого цикла
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        AI Анализ цикла
      </h2>

      <div className="space-y-4">
        {rslContent && (
          <RoleSection role="research_strategy_lead" content={rslContent} />
        )}
        {masterCuratorContent && (
          <RoleSection role="master_curator" content={masterCuratorContent} />
        )}
        {redTeamContent && (
          <RoleSection role="red_team" content={redTeamContent} />
        )}
        {metaSupervisorContent && (
          <RoleSection role="meta_supervisor" content={metaSupervisorContent} />
        )}
      </div>
    </div>
  )
}

// Standalone component for viewing analysis without cycle context
export function AIAnalysisStandalone({ cycleId }: { cycleId: number }) {
  const { data: analysisData, isLoading, error } = useQuery({
    queryKey: ['ai-analysis', cycleId],
    queryFn: () => aiApi.getAnalysis(cycleId),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !analysisData) {
    return (
      <Card>
        <p className="text-center text-muted-foreground py-8">
          Не удалось загрузить анализ
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        AI Анализ цикла #{cycleId}
      </h2>

      <div className="space-y-4">
        {analysisData.results.research_strategy_lead && (
          <RoleSection
            role="research_strategy_lead"
            content={analysisData.results.research_strategy_lead.content}
          />
        )}
        {analysisData.results.master_curator && (
          <RoleSection
            role="master_curator"
            content={analysisData.results.master_curator.content}
          />
        )}
        {analysisData.results.red_team && (
          <RoleSection
            role="red_team"
            content={analysisData.results.red_team.content}
          />
        )}
        {analysisData.results.meta_supervisor && (
          <RoleSection
            role="meta_supervisor"
            content={analysisData.results.meta_supervisor.content}
          />
        )}
      </div>
    </div>
  )
}
