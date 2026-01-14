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
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Plus, Trash2, Package, Info } from "lucide-react"
import { useSlitter, type RMCoil } from "@/lib/slitter-context"

export function RMCoilTab() {
  const { coils, setCoils } = useSlitter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCoil, setNewCoil] = useState<Partial<RMCoil>>({
    type: "HR",
    lineCompatibility: ["Line-1", "Line-2"],
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

          const parsedCoils: RMCoil[] = lines.slice(1).map((line, index) => {
            const values = line.split(",").map((v) => v.trim())
            return {
              id: `coil-${Date.now()}-${index}`,
              coilId: values[headers.indexOf("coil id")] || values[headers.indexOf("coilid")] || `COIL-${index + 1}`,
              type: (values[headers.indexOf("type")]?.toUpperCase() as "HR" | "CR") || "HR",
              grade: values[headers.indexOf("grade")] || "SS304",
              thickness:
                Number.parseFloat(values[headers.indexOf("thickness")] || values[headers.indexOf("thickness(mm)")]) ||
                0,
              width: Number.parseFloat(values[headers.indexOf("width")] || values[headers.indexOf("width(mm)")]) || 0,
              weight:
                Number.parseFloat(values[headers.indexOf("weight")] || values[headers.indexOf("weight(mt)")]) || 0,
              innerDiameter: Number.parseFloat(values[headers.indexOf("inner diameter")]) || undefined,
              outerDiameter: Number.parseFloat(values[headers.indexOf("outer diameter")]) || undefined,
              lineCompatibility: ["Line-1", "Line-2"],
            }
          })

          setCoils([...coils, ...parsedCoils])
        } catch {
          console.error("Error parsing CSV file")
        }
      }
      reader.readAsText(file)
      event.target.value = ""
    },
    [coils, setCoils],
  )

  const handleAddCoil = () => {
    if (!newCoil.coilId || !newCoil.width || !newCoil.weight) return

    const coil: RMCoil = {
      id: `coil-${Date.now()}`,
      coilId: newCoil.coilId,
      type: newCoil.type || "HR",
      grade: newCoil.grade || "SS304",
      thickness: newCoil.thickness || 0,
      width: newCoil.width,
      weight: newCoil.weight,
      innerDiameter: newCoil.innerDiameter,
      outerDiameter: newCoil.outerDiameter,
      lineCompatibility: newCoil.lineCompatibility || ["Line-1", "Line-2"],
    }

    setCoils([...coils, coil])
    setNewCoil({ type: "HR", lineCompatibility: ["Line-1", "Line-2"] })
    setIsDialogOpen(false)
  }

  const handleDeleteCoil = (id: string) => {
    setCoils(coils.filter((c) => c.id !== id))
  }

  const handleLineCompatibilityChange = (line: "Line-1" | "Line-2", checked: boolean) => {
    const current = newCoil.lineCompatibility || []
    if (checked) {
      setNewCoil({ ...newCoil, lineCompatibility: [...current, line] })
    } else {
      setNewCoil({ ...newCoil, lineCompatibility: current.filter((l) => l !== line) })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">RM Coils (HR & CR)</h2>
          <p className="text-muted-foreground">Manage raw material coil inventory</p>
        </div>
        <div className="flex gap-3">
          <Label htmlFor="coil-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
              <Upload className="h-4 w-4" />
              Upload CSV
            </div>
            <Input id="coil-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </Label>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Coil
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Coil</DialogTitle>
                <DialogDescription>Enter the coil details below</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coilId">Coil ID</Label>
                    <Input
                      id="coilId"
                      value={newCoil.coilId || ""}
                      onChange={(e) => setNewCoil({ ...newCoil, coilId: e.target.value })}
                      placeholder="e.g., HR-2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newCoil.type}
                      onValueChange={(value: "HR" | "CR") => setNewCoil({ ...newCoil, type: value })}
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
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      value={newCoil.grade || ""}
                      onChange={(e) => setNewCoil({ ...newCoil, grade: e.target.value })}
                      placeholder="e.g., SS304"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thickness">Thickness (MM)</Label>
                    <Input
                      id="thickness"
                      type="number"
                      step="0.1"
                      value={newCoil.thickness || ""}
                      onChange={(e) => setNewCoil({ ...newCoil, thickness: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (MM)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={newCoil.width || ""}
                      onChange={(e) => setNewCoil({ ...newCoil, width: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (MT)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={newCoil.weight || ""}
                      onChange={(e) => setNewCoil({ ...newCoil, weight: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Line Compatibility</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="line1"
                        checked={newCoil.lineCompatibility?.includes("Line-1")}
                        onCheckedChange={(checked) => handleLineCompatibilityChange("Line-1", !!checked)}
                      />
                      <Label htmlFor="line1" className="text-sm">
                        Line-1
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="line2"
                        checked={newCoil.lineCompatibility?.includes("Line-2")}
                        onCheckedChange={(checked) => handleLineCompatibilityChange("Line-2", !!checked)}
                      />
                      <Label htmlFor="line2" className="text-sm">
                        Line-2
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCoil}>Add Coil</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
            <Info className="h-5 w-5" />
            CSV File Format
          </CardTitle>
          <CardDescription className="text-blue-700">
            Upload CSV with the following columns (header row required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-white p-3 font-mono text-sm">
            <p className="font-semibold text-blue-900">Required Columns:</p>
            <p className="text-gray-700">Coil ID, Type, Grade, Thickness(mm), Width(mm), Weight(MT)</p>
            <p className="mt-2 font-semibold text-blue-900">Optional Columns:</p>
            <p className="text-gray-700">Inner Diameter, Outer Diameter</p>
            <p className="mt-3 font-semibold text-blue-900">Example:</p>
            <code className="block mt-1 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
              Coil ID,Type,Grade,Thickness(mm),Width(mm),Weight(MT)
              <br />
              HR-2024-001,HR,SS304,2.5,1200,12.5
              <br />
              CR-2024-002,CR,SS316,1.2,1000,8.3
            </code>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Coils</CardDescription>
            <CardTitle className="text-3xl">{coils.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>HR Coils</CardDescription>
            <CardTitle className="text-3xl">{coils.filter((c) => c.type === "HR").length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>CR Coils</CardDescription>
            <CardTitle className="text-3xl">{coils.filter((c) => c.type === "CR").length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Weight (MT)</CardDescription>
            <CardTitle className="text-3xl">{coils.reduce((sum, c) => sum + c.weight, 0).toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coil Inventory</CardTitle>
          <CardDescription>All available raw material coils</CardDescription>
        </CardHeader>
        <CardContent>
          {coils.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No coils added yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Upload a CSV file or add coils manually to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coil ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Thickness (MM)</TableHead>
                    <TableHead>Width (MM)</TableHead>
                    <TableHead>Weight (MT)</TableHead>
                    <TableHead>Line Compatibility</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coils.map((coil) => (
                    <TableRow key={coil.id}>
                      <TableCell className="font-medium">{coil.coilId}</TableCell>
                      <TableCell>
                        <Badge variant={coil.type === "HR" ? "default" : "secondary"}>{coil.type}</Badge>
                      </TableCell>
                      <TableCell>{coil.grade}</TableCell>
                      <TableCell>{coil.thickness}</TableCell>
                      <TableCell>{coil.width}</TableCell>
                      <TableCell>{coil.weight}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {coil.lineCompatibility.map((line) => (
                            <Badge key={line} variant="outline" className="text-xs">
                              {line}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCoil(coil.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
