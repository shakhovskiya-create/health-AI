import { useQuery } from '@tanstack/react-query'
import { supplementsApi } from '@/api/client'
import { Card } from '@/components/common/Card'
import { Clock, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

const timeLabels: Record<string, string> = {
  '05:00': '05:00 — Утро (натощак)',
  '07:30': '07:30 — Завтрак',
  '13:00': '13:00 — Обед',
  '16:00': '16:00 — Перед тренировкой',
  '22:00': '22:00 — Перед сном',
}

export default function ScheduleWidget() {
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['supplements', 'schedule'],
    queryFn: supplementsApi.getSchedule,
  })

  if (isLoading) {
    return (
      <Card title="Расписание на сегодня">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg" />
          ))}
        </div>
      </Card>
    )
  }

  // Sort schedule by time
  const sortedSchedule = schedule?.sort((a, b) =>
    a.time_of_day.localeCompare(b.time_of_day)
  )

  return (
    <Card title="Расписание на сегодня" description="Приём препаратов">
      <div className="space-y-4">
        {sortedSchedule?.map((item) => (
          <div key={item.time_of_day} className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{timeLabels[item.time_of_day] || item.time_of_day}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {item.supplements.length} препаратов
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-6">
              {item.supplements.slice(0, 6).map((supp) => (
                <div
                  key={supp.id}
                  className={cn(
                    'flex items-center gap-2 text-sm p-2 rounded-md',
                    'bg-muted/50 hover:bg-muted transition-colors cursor-pointer'
                  )}
                >
                  <Circle className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{supp.name}</span>
                  {supp.dose && (
                    <span className="ml-auto text-xs text-muted-foreground shrink-0">
                      {supp.dose}
                    </span>
                  )}
                </div>
              ))}
              {item.supplements.length > 6 && (
                <div className="text-xs text-muted-foreground p-2">
                  +{item.supplements.length - 6} ещё
                </div>
              )}
            </div>
          </div>
        ))}
        {(!sortedSchedule || sortedSchedule.length === 0) && (
          <p className="text-center text-muted-foreground py-4">
            Нет препаратов в расписании
          </p>
        )}
      </div>
    </Card>
  )
}
