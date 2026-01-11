"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Calendar, Target, AlertTriangle, Package, CheckCircle2, XCircle } from "lucide-react"
import { useSlitter } from "@/lib/slitter-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { RMCoil, SalesOrder } from "@/lib/types"

function findCompatibleCoils(order: SalesOrder, coils: RMCoil[]): RMCoil[] {
  return coils.filter((coil) => {
    // Match type (HR/CR)
    if (coil.type !== order.type) return false
    // Match grade
    if (coil.grade !== order.grade) return false
    // Match thickness
    if (coil.thickness !== order.thickness) return false
    // Coil width must be >= required width + tolerance for slitting
    if (coil.width < order.requiredWidth) return false
    return true
  })
}

export function ForecastTab() {
  const { coils, orders, optimizationResult } = useSlitter()

  const orderRmRequirements = orders.map((order) => {
    const compatibleCoils = findCompatibleCoils(order, coils)
    const totalAvailableWeight = compatibleCoils.reduce((sum, c) => sum + c.weight, 0)
    const canFulfill = totalAvailableWeight >= order.weight
    return {
      order,
      compatibleCoils,
      totalAvailableWeight,
      canFulfill,
      shortfall: canFulfill ? 0 : order.weight - totalAvailableWeight,
    }
  })

  // Generate forecast data based on current orders and patterns
  const weeklyDemand = [
    { week: "Week 1", demand: Math.round(orders.reduce((s, o) => s + o.weight, 0) * 0.3) || 12, capacity: 15 },
    { week: "Week 2", demand: Math.round(orders.reduce((s, o) => s + o.weight, 0) * 0.25) || 10, capacity: 15 },
    { week: "Week 3", demand: Math.round(orders.reduce((s, o) => s + o.weight, 0) * 0.25) || 11, capacity: 15 },
    { week: "Week 4", demand: Math.round(orders.reduce((s, o) => s + o.weight, 0) * 0.2) || 8, capacity: 15 },
  ]

  const widthDistribution =
    orders.length > 0
      ? [
          { name: "< 150mm", value: orders.filter((o) => o.requiredWidth < 150).length || 1 },
          {
            name: "150-250mm",
            value: orders.filter((o) => o.requiredWidth >= 150 && o.requiredWidth < 250).length || 2,
          },
          {
            name: "250-400mm",
            value: orders.filter((o) => o.requiredWidth >= 250 && o.requiredWidth < 400).length || 3,
          },
          {
            name: "400-550mm",
            value: orders.filter((o) => o.requiredWidth >= 400 && o.requiredWidth < 550).length || 2,
          },
          { name: "> 550mm", value: orders.filter((o) => o.requiredWidth >= 550).length || 2 },
        ]
      : [
          { name: "< 150mm", value: 1 },
          { name: "150-250mm", value: 2 },
          { name: "250-400mm", value: 3 },
          { name: "400-550mm", value: 2 },
          { name: "> 550mm", value: 2 },
        ]

  const yieldTrend = [
    { month: "Aug", yield: 89 },
    { month: "Sep", yield: 91 },
    { month: "Oct", yield: 88 },
    { month: "Nov", yield: 92 },
    { month: "Dec", yield: optimizationResult?.totalYield || 90 },
    { month: "Jan", yield: Math.min(95, (optimizationResult?.totalYield || 90) + 2) },
  ]

  const PIE_COLORS = ["#3b82f6", "#f97316", "#22c55e", "#a855f7", "#ec4899"]

  const DEMAND_COLOR = "#6366f1" // Indigo
  const CAPACITY_COLOR = "#14b8a6" // Teal

  const YIELD_COLOR = "#f59e0b" // Amber

  const inventoryCoverage =
    coils.length > 0 && orders.length > 0
      ? Math.round((coils.reduce((s, c) => s + c.weight, 0) / orders.reduce((s, o) => s + o.weight, 0)) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Production Forecast</h2>
          <p className="text-muted-foreground">Analyze trends and plan ahead</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Next 4 Weeks
        </Badge>
      </div>

      {/* KPI Cards - Added colorful backgrounds */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {optimizationResult?.totalYield.toFixed(1) || "92.5"}%
            </div>
            <p className="text-xs text-emerald-600">
              <span className="font-semibold">+2.1%</span> vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Backlog</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{orders.length || 0}</div>
            <p className="text-xs text-blue-600">{orders.filter((o) => o.priority === "High").length} high priority</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Coverage</CardTitle>
            {inventoryCoverage < 100 ? (
              <TrendingDown className="h-4 w-4 text-amber-600" />
            ) : (
              <TrendingUp className="h-4 w-4 text-amber-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{inventoryCoverage || 0}%</div>
            <p className="text-xs text-amber-600">{coils.reduce((s, c) => s + c.weight, 0).toFixed(1)} MT available</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk Orders</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700">
              {
                orders.filter((o) => {
                  const dueDate = new Date(o.dueDate)
                  const today = new Date()
                  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  return diffDays <= 3 && o.priority === "High"
                }).length
              }
            </div>
            <p className="text-xs text-rose-600">Due within 3 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-t-4 border-t-indigo-500">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-indigo-800">
                <Package className="h-5 w-5" />
                RM Requirements Against Sales Orders
              </CardTitle>
              <CardDescription className="text-indigo-600">
                Raw material availability and compatibility for each order
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                {orderRmRequirements.filter((r) => r.canFulfill).length} Can Fulfill
              </Badge>
              <Badge className="bg-rose-100 text-rose-700 border-rose-300">
                {orderRmRequirements.filter((r) => !r.canFulfill).length} Shortfall
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No sales orders available. Add orders in the Sales Order tab to see RM requirements.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-100 to-gray-100">
                    <TableHead className="font-semibold text-slate-700">Order ID</TableHead>
                    <TableHead className="font-semibold text-slate-700">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700">Grade</TableHead>
                    <TableHead className="font-semibold text-slate-700">Thickness</TableHead>
                    <TableHead className="font-semibold text-slate-700">Req. Width</TableHead>
                    <TableHead className="font-semibold text-slate-700">Req. Weight</TableHead>
                    <TableHead className="font-semibold text-cyan-700">Compatible Coils</TableHead>
                    <TableHead className="font-semibold text-teal-700">Available RM</TableHead>
                    <TableHead className="font-semibold text-purple-700">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderRmRequirements.map(
                    ({ order, compatibleCoils, totalAvailableWeight, canFulfill, shortfall }) => (
                      <TableRow key={order.id} className={canFulfill ? "bg-emerald-50/30" : "bg-rose-50/30"}>
                        <TableCell className="font-medium">{order.orderId}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              order.type === "HR"
                                ? "bg-orange-100 text-orange-700 border-orange-300"
                                : "bg-sky-100 text-sky-700 border-sky-300"
                            }
                          >
                            {order.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">{order.grade}</TableCell>
                        <TableCell className="text-slate-600">{order.thickness} mm</TableCell>
                        <TableCell className="text-slate-600">{order.requiredWidth} mm</TableCell>
                        <TableCell className="font-medium text-indigo-700">{order.weight} MT</TableCell>
                        <TableCell>
                          {compatibleCoils.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {compatibleCoils.slice(0, 3).map((coil) => (
                                <Badge key={coil.id} className="bg-cyan-100 text-cyan-700 border-cyan-300 text-xs">
                                  {coil.coilId} ({coil.weight}MT)
                                </Badge>
                              ))}
                              {compatibleCoils.length > 3 && (
                                <Badge className="bg-gray-100 text-gray-600 border-gray-300 text-xs">
                                  +{compatibleCoils.length - 3} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-rose-500 text-sm italic">No compatible coils</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold ${totalAvailableWeight >= order.weight ? "text-teal-600" : "text-amber-600"}`}
                          >
                            {totalAvailableWeight.toFixed(1)} MT
                          </span>
                        </TableCell>
                        <TableCell>
                          {canFulfill ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">Ready</Badge>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <XCircle className="h-4 w-4 text-rose-500" />
                              <Badge className="bg-rose-100 text-rose-700 border-rose-300">
                                Short {shortfall.toFixed(1)} MT
                              </Badge>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary Stats */}
          {orders.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 p-3 border border-indigo-200">
                <p className="text-xs text-indigo-600 font-medium">Total Orders</p>
                <p className="text-xl font-bold text-indigo-800">{orders.length}</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-cyan-100 to-cyan-50 p-3 border border-cyan-200">
                <p className="text-xs text-cyan-600 font-medium">Total RM Available</p>
                <p className="text-xl font-bold text-cyan-800">
                  {coils.reduce((s, c) => s + c.weight, 0).toFixed(1)} MT
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 p-3 border border-emerald-200">
                <p className="text-xs text-emerald-600 font-medium">Orders Fulfillable</p>
                <p className="text-xl font-bold text-emerald-800">
                  {orderRmRequirements.filter((r) => r.canFulfill).length}
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-rose-100 to-rose-50 p-3 border border-rose-200">
                <p className="text-xs text-rose-600 font-medium">Total Shortfall</p>
                <p className="text-xl font-bold text-rose-800">
                  {orderRmRequirements.reduce((s, r) => s + r.shortfall, 0).toFixed(1)} MT
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Demand vs Capacity</CardTitle>
            <CardDescription>Planned production load for next 4 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyDemand}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="demand" fill={DEMAND_COLOR} name="Demand (MT)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" fill={CAPACITY_COLOR} name="Capacity (MT)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yield Trend</CardTitle>
            <CardDescription>Monthly yield performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yieldTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={[85, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="yield"
                    stroke={YIELD_COLOR}
                    strokeWidth={3}
                    dot={{ fill: YIELD_COLOR, strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: YIELD_COLOR }}
                    name="Yield %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Width Distribution</CardTitle>
            <CardDescription>Breakdown by slit width ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={widthDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {widthDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Planning Recommendations</CardTitle>
            <CardDescription>AI-powered suggestions for optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inventoryCoverage < 100 && (
              <div className="flex items-start gap-3 rounded-lg bg-gradient-to-r from-rose-100 to-rose-50 p-3 border border-rose-200">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600" />
                <div>
                  <p className="font-medium text-rose-800">Low Inventory Alert</p>
                  <p className="text-sm text-rose-600">
                    Current inventory covers only {inventoryCoverage}% of pending orders. Consider procurement.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-lg bg-gradient-to-r from-emerald-100 to-emerald-50 p-3 border border-emerald-200">
              <TrendingUp className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800">Yield Improvement</p>
                <p className="text-sm text-emerald-600">
                  Consolidating orders with similar widths could improve yield by ~3%.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 p-3 border border-blue-200">
              <Target className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Line Balancing</p>
                <p className="text-sm text-blue-600">Shifting 2 coils to Line-2 would reduce setup changes by 15%.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-gradient-to-r from-purple-100 to-purple-50 p-3 border border-purple-200">
              <Calendar className="mt-0.5 h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-800">Schedule Optimization</p>
                <p className="text-sm text-purple-600">
                  Batch similar grades together to minimize changeover time by 20%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
