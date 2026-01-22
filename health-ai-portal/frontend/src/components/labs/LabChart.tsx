import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { LabTrend, LabResult } from '@/types'

interface LabChartProps {
  trends: LabTrend[]
  selectedMarkers?: string[]
  referenceRanges?: Record<string, { min: number | null; max: number | null }>
  height?: number
}

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export function LabChart({
  trends,
  selectedMarkers,
  referenceRanges: _referenceRanges,
  height = 300,
}: LabChartProps) {
  const markersToShow = selectedMarkers || trends.map((t) => t.marker_name)

  const { chartData, markers } = useMemo(() => {
    const filteredTrends = trends.filter((t) =>
      markersToShow.includes(t.marker_name)
    )

    // Collect all unique dates
    const allDates = new Set<string>()
    filteredTrends.forEach((trend) => {
      trend.data_points.forEach((dp) => {
        allDates.add(dp.date.split('T')[0])
      })
    })

    // Sort dates
    const sortedDates = Array.from(allDates).sort()

    // Build chart data
    const data = sortedDates.map((date) => {
      const point: Record<string, number | string> = {
        date,
        dateFormatted: format(parseISO(date), 'd MMM yyyy', { locale: ru }),
      }

      filteredTrends.forEach((trend) => {
        const dp = trend.data_points.find(
          (p) => p.date.split('T')[0] === date
        )
        if (dp) {
          point[trend.marker_name] = dp.value
        }
      })

      return point
    })

    return {
      chartData: data,
      markers: filteredTrends.map((t) => ({
        name: t.marker_name,
        unit: t.unit,
      })),
    }
  }, [trends, markersToShow])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Нет данных для отображения
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="dateFormatted"
          tick={{ fill: 'currentColor', fontSize: 12 }}
          tickLine={{ stroke: 'currentColor' }}
        />
        <YAxis
          tick={{ fill: 'currentColor', fontSize: 12 }}
          tickLine={{ stroke: 'currentColor' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        {markers.map((marker, index) => (
            <Line
              key={marker.name}
              type="monotone"
              dataKey={marker.name}
              name={`${marker.name} (${marker.unit})`}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ fill: COLORS[index % COLORS.length], r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

interface SingleMarkerChartProps {
  markerName: string
  data: LabResult[]
  height?: number
}

export function SingleMarkerChart({
  markerName,
  data,
  height = 250,
}: SingleMarkerChartProps) {
  const { chartData, unit, refMin, refMax } = useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime()
    )

    const firstWithRef = sorted.find((d) => d.reference_min || d.reference_max)

    return {
      chartData: sorted.map((d) => ({
        date: format(parseISO(d.test_date), 'd MMM yy', { locale: ru }),
        value: d.value,
        refMin: d.reference_min,
        refMax: d.reference_max,
      })),
      unit: sorted[0]?.unit || '',
      refMin: firstWithRef?.reference_min ?? null,
      refMax: firstWithRef?.reference_max ?? null,
    }
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        Нет данных
      </div>
    )
  }

  const values = chartData.map((d) => d.value).filter((v): v is number => v !== null)
  const minValue = Math.min(...values, refMin ?? Infinity)
  const maxValue = Math.max(...values, refMax ?? -Infinity)
  const padding = (maxValue - minValue) * 0.1 || 1
  const yMin = Math.floor(minValue - padding)
  const yMax = Math.ceil(maxValue + padding)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{markerName}</h4>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'currentColor', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill: 'currentColor', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [value, markerName]}
          />
          {refMin !== null && refMax !== null && (
            <ReferenceArea
              y1={refMin}
              y2={refMax}
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              stroke="none"
            />
          )}
          {refMin !== null && (
            <ReferenceLine
              y={refMin}
              stroke="hsl(var(--primary))"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          )}
          {refMax !== null && (
            <ReferenceLine
              y={refMax}
              stroke="hsl(var(--primary))"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={(props: { cx?: number; cy?: number; payload?: { value: number | null } }) => {
              const { cx, cy, payload } = props
              if (!cx || !cy || !payload || payload.value === null) return <></>
              const isOutOfRange =
                (refMin !== null && payload.value < refMin) ||
                (refMax !== null && payload.value > refMax)
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={isOutOfRange ? '#ef4444' : '#3b82f6'}
                  stroke="white"
                  strokeWidth={2}
                />
              )
            }}
            activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      {refMin !== null && refMax !== null && (
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>Референс: {refMin} — {refMax} {unit}</span>
        </div>
      )}
    </div>
  )
}

interface MarkerSelectorProps {
  markers: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function MarkerSelector({ markers, selected, onChange }: MarkerSelectorProps) {
  const toggleMarker = (marker: string) => {
    if (selected.includes(marker)) {
      onChange(selected.filter((m) => m !== marker))
    } else {
      onChange([...selected, marker])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {markers.map((marker) => (
        <button
          key={marker}
          onClick={() => toggleMarker(marker)}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            selected.includes(marker)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          {marker}
        </button>
      ))}
    </div>
  )
}
