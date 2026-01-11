"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SlittingPattern, LineSpec } from "@/lib/slitter-context"

interface SlitterLineLoadViewProps {
  patterns: SlittingPattern[]
  lineSpecs: LineSpec[]
}

export function SlitterLineLoadView({ patterns, lineSpecs }: SlitterLineLoadViewProps) {
  const line1Patterns = patterns.filter((p) => p.assignedLine === "Line-1")
  const line2Patterns = patterns.filter((p) => p.assignedLine === "Line-2")

  const line1Spec = lineSpecs.find((l) => l.lineName === "Line-1")
  const line2Spec = lineSpecs.find((l) => l.lineName === "Line-2")

  const calculateTotalTime = (linePatterns: SlittingPattern[], spec?: LineSpec) => {
    if (!spec) return 0
    // Assume ~20 min per coil + setup time for changeovers
    const baseTime = linePatterns.length * 20
    const setupChanges = Math.max(0, linePatterns.length - 1) * spec.setupTime
    return baseTime + setupChanges
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slitter Line Load View</CardTitle>
        <CardDescription>Gantt-style view of coil sequence per line</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Line 1 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default">Line-1</Badge>
              <span className="text-sm text-muted-foreground">
                {line1Patterns.length} coils | ~{calculateTotalTime(line1Patterns, line1Spec)} min
              </span>
            </div>
            {line1Spec && (
              <div className="flex gap-2">
                {line1Spec.hrCapability && <Badge variant="outline">HR</Badge>}
                {line1Spec.crCapability && <Badge variant="outline">CR</Badge>}
              </div>
            )}
          </div>

          <div className="flex gap-1 overflow-x-auto pb-2">
            {line1Patterns.length > 0 ? (
              line1Patterns.map((pattern, idx) => (
                <div key={pattern.id} className="flex items-center">
                  <div
                    className="flex h-10 min-w-[100px] items-center justify-center rounded bg-chart-4 px-3 text-xs font-medium text-primary-foreground"
                    title={`${pattern.coilId} - Yield: ${pattern.yieldPercent.toFixed(1)}%`}
                  >
                    {pattern.coilId}
                  </div>
                  {idx < line1Patterns.length - 1 && (
                    <div
                      className="mx-1 flex h-10 w-6 items-center justify-center rounded bg-chart-3/50 text-xs text-primary-foreground"
                      title="Setup Change"
                    >
                      ⚙
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex h-10 w-full items-center justify-center rounded border border-dashed border-border text-sm text-muted-foreground">
                No coils assigned
              </div>
            )}
          </div>
        </div>

        {/* Line 2 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Line-2</Badge>
              <span className="text-sm text-muted-foreground">
                {line2Patterns.length} coils | ~{calculateTotalTime(line2Patterns, line2Spec)} min
              </span>
            </div>
            {line2Spec && (
              <div className="flex gap-2">
                {line2Spec.hrCapability && <Badge variant="outline">HR</Badge>}
                {line2Spec.crCapability && <Badge variant="outline">CR</Badge>}
              </div>
            )}
          </div>

          <div className="flex gap-1 overflow-x-auto pb-2">
            {line2Patterns.length > 0 ? (
              line2Patterns.map((pattern, idx) => (
                <div key={pattern.id} className="flex items-center">
                  <div
                    className="flex h-10 min-w-[100px] items-center justify-center rounded bg-chart-1 px-3 text-xs font-medium text-primary-foreground"
                    title={`${pattern.coilId} - Yield: ${pattern.yieldPercent.toFixed(1)}%`}
                  >
                    {pattern.coilId}
                  </div>
                  {idx < line2Patterns.length - 1 && (
                    <div
                      className="mx-1 flex h-10 w-6 items-center justify-center rounded bg-chart-3/50 text-xs text-primary-foreground"
                      title="Setup Change"
                    >
                      ⚙
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex h-10 w-full items-center justify-center rounded border border-dashed border-border text-sm text-muted-foreground">
                No coils assigned
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 border-t border-border pt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-chart-4" />
            <span>Line-1 Coil</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-chart-1" />
            <span>Line-2 Coil</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-chart-3/50" />
            <span>Setup Change</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
