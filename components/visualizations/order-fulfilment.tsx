"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { SlittingPattern, SalesOrder } from "@/lib/slitter-context"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface OrderFulfilmentDashboardProps {
  patterns: SlittingPattern[]
  orders: SalesOrder[]
  ordersCovered: number
  totalOrders: number
}

export function OrderFulfilmentDashboard({
  patterns,
  orders,
  ordersCovered,
  totalOrders,
}: OrderFulfilmentDashboardProps) {
  const completionPercent = totalOrders > 0 ? (ordersCovered / totalOrders) * 100 : 0

  // Get covered order IDs
  const coveredOrderIds = new Set<string>()
  for (const pattern of patterns) {
    for (const slit of pattern.slitWidths) {
      if (slit.orderId) coveredOrderIds.add(slit.orderId)
    }
  }

  // Calculate weight fulfilled
  const totalWeight = orders.reduce((sum, o) => sum + o.weight, 0)
  const fulfilledWeight = orders.filter((o) => coveredOrderIds.has(o.orderId)).reduce((sum, o) => sum + o.weight, 0)
  const weightPercent = totalWeight > 0 ? (fulfilledWeight / totalWeight) * 100 : 0

  // Group orders by status
  const completedOrders = orders.filter((o) => coveredOrderIds.has(o.orderId))
  const pendingOrders = orders.filter((o) => !coveredOrderIds.has(o.orderId))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Fulfilment Dashboard</CardTitle>
        <CardDescription>Track order completion status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Indicators */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Orders Completed</span>
              <span className="font-medium">
                {ordersCovered}/{totalOrders}
              </span>
            </div>
            <Progress value={completionPercent} className="h-3" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Weight Fulfilled</span>
              <span className="font-medium">
                {fulfilledWeight.toFixed(1)}/{totalWeight.toFixed(1)} MT
              </span>
            </div>
            <Progress value={weightPercent} className="h-3" />
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-chart-1/10 p-3 text-center">
            <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-chart-1" />
            <p className="text-2xl font-bold text-chart-1">{completedOrders.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="rounded-lg bg-chart-2/10 p-3 text-center">
            <Clock className="mx-auto mb-1 h-5 w-5 text-chart-2" />
            <p className="text-2xl font-bold text-chart-2">{pendingOrders.length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="rounded-lg bg-chart-3/10 p-3 text-center">
            <AlertCircle className="mx-auto mb-1 h-5 w-5 text-chart-3" />
            <p className="text-2xl font-bold text-chart-3">
              {pendingOrders.filter((o) => o.priority === "High").length}
            </p>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </div>
        </div>

        {/* Order List */}
        <div className="max-h-[200px] space-y-2 overflow-y-auto">
          {orders.slice(0, 8).map((order) => {
            const isCompleted = coveredOrderIds.has(order.orderId)
            return (
              <div
                key={order.id}
                className={`flex items-center justify-between rounded-lg p-2 ${
                  isCompleted ? "bg-chart-1/10" : "bg-secondary"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-chart-1" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{order.orderId}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.requiredWidth}mm × {order.weight}MT
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
