"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SlittingPattern, RMCoil } from "@/lib/slitter-context"

interface CoilSlittingVisualizationProps {
  patterns: SlittingPattern[]
  coils: RMCoil[]
}

const SLIT_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-4", "bg-chart-5"]

export function CoilSlittingVisualization({ patterns, coils }: CoilSlittingVisualizationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coil Slitting Visualization</CardTitle>
        <CardDescription>Visual representation of slitting patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {patterns.slice(0, 5).map((pattern) => {
          const coil = coils.find((c) => c.coilId === pattern.coilId)
          const totalWidth = coil?.width || 1250

          return (
            <div key={pattern.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{pattern.coilId}</span>
                <span className="text-muted-foreground">
                  {totalWidth} MM | Yield: {pattern.yieldPercent.toFixed(1)}%
                </span>
              </div>

              <div className="flex h-12 w-full overflow-hidden rounded-lg border border-border">
                {pattern.slitWidths.map((slit, idx) => {
                  const widthPercent = ((slit.width * slit.quantity) / totalWidth) * 100
                  const colorClass = SLIT_COLORS[idx % SLIT_COLORS.length]

                  return (
                    <div
                      key={idx}
                      className={`${colorClass} flex items-center justify-center border-r border-background text-xs font-medium text-primary-foreground`}
                      style={{ width: `${widthPercent}%` }}
                      title={`${slit.width}mm x ${slit.quantity} (${slit.orderId || "N/A"})`}
                    >
                      {widthPercent > 8 && `${slit.width}`}
                    </div>
                  )
                })}

                {/* Scrap */}
                {pattern.scrapWidth > 0 && (
                  <div
                    className="flex items-center justify-center bg-chart-3 text-xs font-medium text-primary-foreground"
                    style={{ width: `${(pattern.scrapWidth / totalWidth) * 100}%` }}
                    title={`Scrap: ${pattern.scrapWidth}mm`}
                  >
                    {(pattern.scrapWidth / totalWidth) * 100 > 5 && "Scrap"}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {pattern.slitWidths.map((slit, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div className={`h-3 w-3 rounded ${SLIT_COLORS[idx % SLIT_COLORS.length]}`} />
                    <span>
                      {slit.width}mm x{slit.quantity}
                    </span>
                    {slit.orderId && <span className="text-muted-foreground">({slit.orderId})</span>}
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-chart-3" />
                  <span>Scrap: {pattern.scrapWidth}mm</span>
                </div>
              </div>
            </div>
          )
        })}

        {patterns.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">No patterns to visualize</div>
        )}
      </CardContent>
    </Card>
  )
}
