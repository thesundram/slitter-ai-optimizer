"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SlittingPattern } from "@/lib/slitter-context"
import type { RMCoil } from "@/lib/slitter-context"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface YieldScrapChartProps {
  patterns: SlittingPattern[]
  coils: RMCoil[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-md">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value.toFixed(2)} MT (
            {entry.payload[entry.dataKey === "useWeight" ? "yieldPercent" : "scrapPercent"]}%)
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function YieldScrapChart({ patterns, coils }: YieldScrapChartProps) {
  const data = patterns.map((p) => {
    const coil = coils.find((c) => c.coilId === p.coilId)
    const totalWeight = coil?.weight || 0
    const useWeight = (p.yieldPercent / 100) * totalWeight
    const scrapWeight = ((100 - p.yieldPercent) / 100) * totalWeight

    return {
      name: p.coilId,
      useWeight: useWeight,
      scrapWeight: scrapWeight,
      yieldPercent: p.yieldPercent.toFixed(1),
      scrapPercent: (100 - p.yieldPercent).toFixed(1),
      totalWeight: totalWeight,
    }
  })

  const useWeightColor = "#3b82f6" // Blue
  const scrapWeightColor = "#f97316" // Orange

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yield vs Scrap Analysis</CardTitle>
        <CardDescription>Use weight and scrap weight (MT) with percentage by coil</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${value.toFixed(1)} MT`}
                />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="useWeight"
                  stackId="a"
                  fill={useWeightColor}
                  name="Use Weight (MT)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="scrapWeight"
                  stackId="a"
                  fill={scrapWeightColor}
                  name="Scrap Weight (MT)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No data to display</div>
          )}
        </div>
        {data.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Total Use Weight</p>
              <p className="text-xl font-bold text-blue-700">
                {data.reduce((sum, d) => sum + d.useWeight, 0).toFixed(2)} MT
              </p>
              <p className="text-xs text-blue-500">
                (
                {(
                  (data.reduce((sum, d) => sum + d.useWeight, 0) / data.reduce((sum, d) => sum + d.totalWeight, 0)) *
                  100
                ).toFixed(1)}
                % of total)
              </p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3 border border-orange-200">
              <p className="text-sm text-orange-600 font-medium">Total Scrap Weight</p>
              <p className="text-xl font-bold text-orange-700">
                {data.reduce((sum, d) => sum + d.scrapWeight, 0).toFixed(2)} MT
              </p>
              <p className="text-xs text-orange-500">
                (
                {(
                  (data.reduce((sum, d) => sum + d.scrapWeight, 0) / data.reduce((sum, d) => sum + d.totalWeight, 0)) *
                  100
                ).toFixed(1)}
                % of total)
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
