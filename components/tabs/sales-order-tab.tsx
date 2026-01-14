"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Plus, Trash2, FileText, Pencil, Info } from "lucide-react"
import { useSlitter, type SalesOrder } from "@/lib/slitter-context"

export function SalesOrderTab() {
  const { orders, setOrders } = useSlitter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null)
  const [newOrder, setNewOrder] = useState<Partial<SalesOrder>>({
    type: "HR",
    priority: "Medium",
    widthTolerance: 2,
    noOfSlit: 1,
  })

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split("\n").filter((line) => line.trim())
          const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

          const parsedOrders: SalesOrder[] = lines.slice(1).map((line, index) => {
            const values = line.split(",").map((v) => v.trim())
            return {
              id: `order-${Date.now()}-${index}`,
              orderId: values[headers.indexOf("order id")] || values[headers.indexOf("orderid")] || `ORD-${index + 1}`,
              type: (values[headers.indexOf("type")]?.toUpperCase() as "HR" | "CR") || "HR",
              requiredWidth:
                Number.parseFloat(
                  values[headers.indexOf("required slit width")] ||
                    values[headers.indexOf("required slit width(mm)")] ||
                    values[headers.indexOf("required width")] ||
                    values[headers.indexOf("width")] ||
                    values[headers.indexOf("required width(mm)")],
                ) || 0,
              weight:
                Number.parseFloat(values[headers.indexOf("weight")] || values[headers.indexOf("weight(mt)")]) || 0,
              grade: values[headers.indexOf("grade")] || "SS304",
              thickness:
                Number.parseFloat(values[headers.indexOf("thickness")] || values[headers.indexOf("thickness(mm)")]) ||
                0,
              priority: (values[headers.indexOf("priority")] as "High" | "Medium" | "Low") || "Medium",
              dueDate:
                values[headers.indexOf("due date")] ||
                values[headers.indexOf("duedate")] ||
                new Date().toISOString().split("T")[0],
              widthTolerance:
                Number.parseFloat(values[headers.indexOf("tolerance")] || values[headers.indexOf("width tolerance")]) ||
                2,
              noOfSlit:
                Number.parseInt(values[headers.indexOf("no of slit")] || values[headers.indexOf("noofslit")]) || 1,
            }
          })

          setOrders([...orders, ...parsedOrders])
        } catch {
          console.error("Error parsing CSV file")
        }
      }
      reader.readAsText(file)
      event.target.value = ""
    },
    [orders, setOrders],
  )

  const handleAddOrder = () => {
    if (!newOrder.orderId || !newOrder.requiredWidth || !newOrder.weight) return

    const order: SalesOrder = {
      id: `order-${Date.now()}`,
      orderId: newOrder.orderId,
      type: newOrder.type || "HR",
      requiredWidth: newOrder.requiredWidth,
      weight: newOrder.weight,
      grade: newOrder.grade || "SS304",
      thickness: newOrder.thickness || 0,
      priority: newOrder.priority || "Medium",
      dueDate: newOrder.dueDate || new Date().toISOString().split("T")[0],
      widthTolerance: newOrder.widthTolerance || 2,
      noOfSlit: newOrder.noOfSlit || 1,
    }

    setOrders([...orders, order])
    setNewOrder({ type: "HR", priority: "Medium", widthTolerance: 2, noOfSlit: 1 })
    setIsDialogOpen(false)
  }

  const handleEditOrder = (order: SalesOrder) => {
    setEditingOrder({ ...order })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingOrder) return

    setOrders(orders.map((o) => (o.id === editingOrder.id ? editingOrder : o)))
    setEditingOrder(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter((o) => o.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      case "Low":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sales Orders</h2>
          <p className="text-muted-foreground">Manage slit coil orders (width &lt; 600mm)</p>
        </div>
        <div className="flex gap-3">
          <Label htmlFor="order-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
              <Upload className="h-4 w-4" />
              Upload CSV
            </div>
            <Input id="order-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </Label>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Order</DialogTitle>
                <DialogDescription>Enter the order details below</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Order ID</Label>
                    <Input
                      id="orderId"
                      value={newOrder.orderId || ""}
                      onChange={(e) => setNewOrder({ ...newOrder, orderId: e.target.value })}
                      placeholder="e.g., ORD-2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderType">Type</Label>
                    <Select
                      value={newOrder.type}
                      onValueChange={(value: "HR" | "CR") => setNewOrder({ ...newOrder, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HR">HR (Hot Rolled)</SelectItem>
                        <SelectItem value="CR">CR (Cold Rolled)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderGrade">Grade</Label>
                    <Input
                      id="orderGrade"
                      value={newOrder.grade || ""}
                      onChange={(e) => setNewOrder({ ...newOrder, grade: e.target.value })}
                      placeholder="e.g., SS304"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderThickness">Thickness (mm)</Label>
                    <Input
                      id="orderThickness"
                      type="number"
                      step="0.1"
                      value={
                        newOrder.thickness === undefined || newOrder.thickness === 0 ? "" : String(newOrder.thickness)
                      }
                      onChange={(e) => {
                        const val = e.target.value
                        setNewOrder({ ...newOrder, thickness: val === "" ? undefined : Number.parseFloat(val) || 0 })
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requiredWidth">Required Slit Width (mm)</Label>
                    <Input
                      id="requiredWidth"
                      type="number"
                      value={
                        newOrder.requiredWidth === undefined || newOrder.requiredWidth === 0
                          ? ""
                          : String(newOrder.requiredWidth)
                      }
                      onChange={(e) => {
                        const val = e.target.value
                        setNewOrder({
                          ...newOrder,
                          requiredWidth: val === "" ? undefined : Number.parseFloat(val) || 0,
                        })
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderWeight">Weight (MT)</Label>
                    <Input
                      id="orderWeight"
                      type="number"
                      step="0.01"
                      value={newOrder.weight === undefined || newOrder.weight === 0 ? "" : String(newOrder.weight)}
                      onChange={(e) => {
                        const val = e.target.value
                        setNewOrder({ ...newOrder, weight: val === "" ? undefined : Number.parseFloat(val) || 0 })
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="noOfSlit">No of Slit</Label>
                    <Input
                      id="noOfSlit"
                      type="number"
                      min="1"
                      value={
                        newOrder.noOfSlit === undefined || newOrder.noOfSlit === 0 ? "" : String(newOrder.noOfSlit)
                      }
                      onChange={(e) => {
                        const val = e.target.value
                        setNewOrder({ ...newOrder, noOfSlit: val === "" ? undefined : Number.parseInt(val) || 1 })
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newOrder.priority}
                      onValueChange={(value: "High" | "Medium" | "Low") =>
                        setNewOrder({ ...newOrder, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newOrder.dueDate || ""}
                      onChange={(e) => setNewOrder({ ...newOrder, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tolerance">Width Tolerance (mm)</Label>
                    <Input
                      id="tolerance"
                      type="number"
                      step="0.5"
                      value={
                        newOrder.widthTolerance === undefined || newOrder.widthTolerance === 0
                          ? ""
                          : String(newOrder.widthTolerance)
                      }
                      onChange={(e) => {
                        const val = e.target.value
                        setNewOrder({
                          ...newOrder,
                          widthTolerance: val === "" ? undefined : Number.parseFloat(val) || 0,
                        })
                      }}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddOrder}>Add Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
            <Info className="h-5 w-5" />
            CSV File Format
          </CardTitle>
          <CardDescription className="text-amber-700">
            Upload CSV with the following columns (header row required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-white p-3 font-mono text-sm">
            <p className="font-semibold text-amber-900">Required Columns:</p>
            <p className="text-gray-700">
              Order ID, Type, Grade, Thickness(mm), Required Slit Width(mm), Weight(MT), No of Slit
            </p>
            <p className="mt-2 font-semibold text-amber-900">Optional Columns:</p>
            <p className="text-gray-700">Priority, Due Date, Tolerance</p>
            <p className="mt-3 font-semibold text-amber-900">Example:</p>
            <code className="block mt-1 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
              Order ID,Type,Grade,Thickness(mm),Required Slit Width(mm),Weight(MT),No of Slit,Priority,Due Date
              <br />
              ORD-2024-001,HR,SS304,2.5,150,5.0,3,High,2024-02-15
              <br />
              ORD-2024-002,CR,SS316,1.2,200,3.5,2,Medium,2024-02-20
            </code>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-3xl">{orders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>High Priority</CardDescription>
            <CardTitle className="text-3xl text-chart-3">
              {orders.filter((o) => o.priority === "High").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Weight (MT)</CardDescription>
            <CardTitle className="text-3xl">{orders.reduce((sum, o) => sum + o.weight, 0).toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Slit Width (mm)</CardDescription>
            <CardTitle className="text-3xl">
              {orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + o.requiredWidth, 0) / orders.length) : 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>All pending slit coil orders</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No orders added yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Upload a CSV file or add orders manually to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Thickness</TableHead>
                    <TableHead>Slit Width (mm)</TableHead>
                    <TableHead>Weight (MT)</TableHead>
                    <TableHead>No of Slit</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderId}</TableCell>
                      <TableCell>
                        <Badge variant={order.type === "HR" ? "default" : "secondary"}>{order.type}</Badge>
                      </TableCell>
                      <TableCell>{order.grade}</TableCell>
                      <TableCell>{order.thickness}</TableCell>
                      <TableCell>{order.requiredWidth}</TableCell>
                      <TableCell>{order.weight}</TableCell>
                      <TableCell>{order.noOfSlit || 1}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(order.priority) as "default" | "secondary" | "destructive"}>
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.dueDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditOrder(order)}>
                            <Pencil className="h-4 w-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteOrder(order.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Update the order details below</DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editOrderId">Order ID</Label>
                  <Input
                    id="editOrderId"
                    value={editingOrder.orderId}
                    onChange={(e) => setEditingOrder({ ...editingOrder, orderId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editOrderType">Type</Label>
                  <Select
                    value={editingOrder.type}
                    onValueChange={(value: "HR" | "CR") => setEditingOrder({ ...editingOrder, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HR">HR (Hot Rolled)</SelectItem>
                      <SelectItem value="CR">CR (Cold Rolled)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editOrderGrade">Grade</Label>
                  <Input
                    id="editOrderGrade"
                    value={editingOrder.grade}
                    onChange={(e) => setEditingOrder({ ...editingOrder, grade: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editOrderThickness">Thickness (mm)</Label>
                  <Input
                    id="editOrderThickness"
                    type="number"
                    step="0.1"
                    value={editingOrder.thickness === 0 ? "" : editingOrder.thickness.toString()}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        thickness: e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editRequiredWidth">Required Slit Width (mm)</Label>
                  <Input
                    id="editRequiredWidth"
                    type="number"
                    value={editingOrder.requiredWidth === 0 ? "" : editingOrder.requiredWidth.toString()}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        requiredWidth: e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editOrderWeight">Weight (MT)</Label>
                  <Input
                    id="editOrderWeight"
                    type="number"
                    step="0.01"
                    value={editingOrder.weight === 0 ? "" : editingOrder.weight.toString()}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        weight: e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editNoOfSlit">No of Slit</Label>
                  <Input
                    id="editNoOfSlit"
                    type="number"
                    min="1"
                    value={(editingOrder.noOfSlit || 1) === 0 ? "" : (editingOrder.noOfSlit || 1).toString()}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        noOfSlit: e.target.value === "" ? 1 : Number.parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPriority">Priority</Label>
                  <Select
                    value={editingOrder.priority}
                    onValueChange={(value: "High" | "Medium" | "Low") =>
                      setEditingOrder({ ...editingOrder, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editDueDate">Due Date</Label>
                  <Input
                    id="editDueDate"
                    type="date"
                    value={editingOrder.dueDate}
                    onChange={(e) => setEditingOrder({ ...editingOrder, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editTolerance">Width Tolerance (mm)</Label>
                  <Input
                    id="editTolerance"
                    type="number"
                    step="0.5"
                    value={editingOrder.widthTolerance === 0 ? "" : editingOrder.widthTolerance.toString()}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        widthTolerance: e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
