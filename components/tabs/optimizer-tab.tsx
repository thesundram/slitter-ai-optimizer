"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Cpu, Play, AlertCircle, CheckCircle2 } from "lucide-react"
import { useSlitter } from "@/lib/slitter-context"
import { runOptimization } from "@/lib/optimizer"
import { CoilSlittingVisualization } from "@/components/visualizations/coil-slitting-viz"
import { YieldScrapChart } from "@/components/visualizations/yield-scrap-chart"
import { OrderFulfilmentDashboard } from "@/components/visualizations/order-fulfilment"
import { SlitterLineLoadView } from "@/components/visualizations/line-load-view"

export function OptimizerTab() {
  const { coils, orders, lineSpecs, weights, setWeights, optimizationResult, setOptimizationResult } = useSlitter()
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [selectedType, setSelectedType] = useState<"HR" | "CR" | "all">("all")
  const [selectedOption, setSelectedOption] = useState(0)

  const canOptimize = coils.length > 0 && orders.length > 0 && lineSpecs.length > 0

  const handleOptimize = async () => {
    setIsOptimizing(true)

    // Simulate optimization delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const filteredCoils = selectedType === "all" ? coils : coils.filter((c) => c.type === selectedType)

    const filteredOrders = selectedType === "all" ? orders : orders.filter((o) => o.type === selectedType)

    const result = runOptimization(filteredCoils, filteredOrders, lineSpecs, weights)
    setOptimizationResult(result)
    setIsOptimizing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Optimization Engine</h2>
          <p className="text-muted-foreground">Generate optimal slitting patterns</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>Adjust optimization parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Material Type</Label>
              <Select value={selectedType} onValueChange={(v: "HR" | "CR" | "all") => setSelectedType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="HR">HR (Hot Rolled)</SelectItem>
                  <SelectItem value="CR">CR (Cold Rolled)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium">Scoring Weights</Label>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Yield % (W1)</span>
                    <span className="text-muted-foreground">{weights.w1}%</span>
                  </div>
                  <Slider
                    value={[weights.w1]}
                    onValueChange={([v]) => setWeights({ ...weights, w1: v })}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Order Completion (W2)</span>
                    <span className="text-muted-foreground">{weights.w2}%</span>
                  </div>
                  <Slider
                    value={[weights.w2]}
                    onValueChange={([v]) => setWeights({ ...weights, w2: v })}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Scrap Penalty (W3)</span>
                    <span className="text-muted-foreground">{weights.w3}%</span>
                  </div>
                  <Slider
                    value={[weights.w3]}
                    onValueChange={([v]) => setWeights({ ...weights, w3: v })}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Setup Penalty (W4)</span>
                    <span className="text-muted-foreground">{weights.w4}%</span>
                  </div>
                  <Slider
                    value={[weights.w4]}
                    onValueChange={([v]) => setWeights({ ...weights, w4: v })}
                    max={100}
                    step={5}
                  />
                </div>
              </div>
            </div>

            {!canOptimize && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing Data</AlertTitle>
                <AlertDescription>Please add coils, orders, and line specs before optimizing.</AlertDescription>
              </Alert>
            )}

            <Button className="w-full" size="lg" onClick={handleOptimize} disabled={!canOptimize || isOptimizing}>
              {isOptimizing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Optimization
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Optimization Results</CardTitle>
            <CardDescription>
              {optimizationResult
                ? `Generated ${optimizationResult.patterns.length} patterns`
                : "Run optimization to see results"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {optimizationResult ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-sm text-muted-foreground">Total Yield</p>
                    <p className="text-2xl font-bold text-chart-1">{optimizationResult.totalYield.toFixed(1)}%</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-sm text-muted-foreground">Total Scrap</p>
                    <p className="text-2xl font-bold text-chart-3">{optimizationResult.totalScrap.toFixed(0)} MM</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-sm text-muted-foreground">Orders Covered</p>
                    <p className="text-2xl font-bold">
                      {optimizationResult.ordersCovered}/{optimizationResult.totalOrders}
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-sm text-muted-foreground">Patterns</p>
                    <p className="text-2xl font-bold">{optimizationResult.patterns.length}</p>
                  </div>
                </div>

                {/* Pattern Options */}
                <div className="space-y-2">
                  <Label>Select Optimization Option</Label>
                  <div className="flex gap-2">
                    {[0, 1, 2].map((idx) => (
                      <Button
                        key={idx}
                        variant={selectedOption === idx ? "default" : "outline"}
                        onClick={() => setSelectedOption(idx)}
                        className="flex-1"
                      >
                        Option {idx + 1}
                        {idx === 0 && (
                          <Badge className="ml-2" variant="secondary">
                            Best
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Accept Button */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-transparent" variant="outline">
                    Tweak Pattern
                  </Button>
                  <Button className="flex-1">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept & Release to Shop Floor
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Cpu className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium">No optimization results yet</h3>
                <p className="text-sm text-muted-foreground">
                  Configure parameters and click &quot;Run Optimization&quot;
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visualizations */}
      {optimizationResult && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Visualizations</h3>

          <div className="grid gap-6 lg:grid-cols-2">
            <CoilSlittingVisualization patterns={optimizationResult.patterns} coils={coils} />
            <YieldScrapChart patterns={optimizationResult.patterns} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <OrderFulfilmentDashboard
              patterns={optimizationResult.patterns}
              orders={orders}
              ordersCovered={optimizationResult.ordersCovered}
              totalOrders={optimizationResult.totalOrders}
            />
            <SlitterLineLoadView patterns={optimizationResult.patterns} lineSpecs={lineSpecs} />
          </div>
        </div>
      )}
    </div>
  )
}
