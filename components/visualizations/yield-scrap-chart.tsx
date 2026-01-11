"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SlittingPattern } from "@/lib/slitter-context"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface YieldScrapChartProps {
  patterns: SlittingPattern[]
}

export function YieldScrapChart({ patterns }: YieldScrapChartProps) {
  const data = patterns.map((p) => ({
    name: p.coilId,
    yield: p.yieldPercent,
    scrap: 100 - p.yieldPercent,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yield vs Scrap Analysis</CardTitle>
        <CardDescription>Yield percentage by coil</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Legend />
                <Bar dataKey="yield" stackId="a" fill="#22c55e" name="Yield %" radius={[0, 4, 4, 0]} />
                <Bar dataKey="scrap" stackId="a" fill="#ef4444" name="Scrap %" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No data to display</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
