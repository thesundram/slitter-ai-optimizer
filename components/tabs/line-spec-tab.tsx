"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
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
import { Plus, Edit, Trash2, Settings } from "lucide-react"
import { useSlitter, type LineSpec } from "@/lib/slitter-context"

export function LineSpecTab() {
  const { lineSpecs, setLineSpecs } = useSlitter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSpec, setEditingSpec] = useState<LineSpec | null>(null)
  const [formData, setFormData] = useState<Partial<LineSpec>>({
    hrCapability: true,
    crCapability: true,
  })

  const openEditDialog = (spec: LineSpec) => {
    setEditingSpec(spec)
    setFormData(spec)
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingSpec(null)
    setFormData({
      hrCapability: true,
      crCapability: true,
      scrapEdgeMin: 5,
      scrapEdgeMax: 10,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.lineName) return

    if (editingSpec) {
      setLineSpecs(lineSpecs.map((s) => (s.id === editingSpec.id ? ({ ...s, ...formData } as LineSpec) : s)))
    } else {
      const newSpec: LineSpec = {
        id: `line-${Date.now()}`,
        lineName: formData.lineName,
        minSlitWidth: formData.minSlitWidth || 50,
        maxSlitWidth: formData.maxSlitWidth || 600,
        maxKnives: formData.maxKnives || 10,
        scrapEdgeMin: formData.scrapEdgeMin || 5,
        scrapEdgeMax: formData.scrapEdgeMax || 10,
        setupChangeCost: formData.setupChangeCost || 500,
        setupTime: formData.setupTime || 30,
        hrCapability: formData.hrCapability ?? true,
        crCapability: formData.crCapability ?? true,
      }
      setLineSpecs([...lineSpecs, newSpec])
    }

    setIsDialogOpen(false)
    setEditingSpec(null)
    setFormData({ hrCapability: true, crCapability: true })
  }

  const handleDelete = (id: string) => {
    setLineSpecs(lineSpecs.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Line Specifications</h2>
          <p className="text-muted-foreground">Configure slitter line parameters</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Line
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSpec ? "Edit Line Specification" : "Add New Line"}</DialogTitle>
              <DialogDescription>Configure the slitter line parameters</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="lineName">Line Name</Label>
                <Input
                  id="lineName"
                  value={formData.lineName || ""}
                  onChange={(e) => setFormData({ ...formData, lineName: e.target.value })}
                  placeholder="e.g., Line-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minSlitWidth">Min Slit Width (MM)</Label>
                  <Input
                    id="minSlitWidth"
                    type="number"
                    value={formData.minSlitWidth || ""}
                    onChange={(e) => setFormData({ ...formData, minSlitWidth: Number.parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSlitWidth">Max Slit Width (MM)</Label>
                  <Input
                    id="maxSlitWidth"
                    type="number"
                    value={formData.maxSlitWidth || ""}
                    onChange={(e) => setFormData({ ...formData, maxSlitWidth: Number.parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxKnives">Max Knives</Label>
                  <Input
                    id="maxKnives"
                    type="number"
                    value={formData.maxKnives || ""}
                    onChange={(e) => setFormData({ ...formData, maxKnives: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setupTime">Setup Time (min)</Label>
                  <Input
                    id="setupTime"
                    type="number"
                    value={formData.setupTime || ""}
                    onChange={(e) => setFormData({ ...formData, setupTime: Number.parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scrapEdgeMin">Scrap Edge Min (MM)</Label>
                  <Input
                    id="scrapEdgeMin"
                    type="number"
                    value={formData.scrapEdgeMin || ""}
                    onChange={(e) => setFormData({ ...formData, scrapEdgeMin: Number.parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scrapEdgeMax">Scrap Edge Max (MM)</Label>
                  <Input
                    id="scrapEdgeMax"
                    type="number"
                    value={formData.scrapEdgeMax || ""}
                    onChange={(e) => setFormData({ ...formData, scrapEdgeMax: Number.parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="setupChangeCost">Setup Change Cost ($)</Label>
                <Input
                  id="setupChangeCost"
                  type="number"
                  value={formData.setupChangeCost || ""}
                  onChange={(e) => setFormData({ ...formData, setupChangeCost: Number.parseFloat(e.target.value) })}
                />
              </div>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hrCapability"
                    checked={formData.hrCapability}
                    onCheckedChange={(checked) => setFormData({ ...formData, hrCapability: checked })}
                  />
                  <Label htmlFor="hrCapability">HR Capability</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="crCapability"
                    checked={formData.crCapability}
                    onCheckedChange={(checked) => setFormData({ ...formData, crCapability: checked })}
                  />
                  <Label htmlFor="crCapability">CR Capability</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{editingSpec ? "Save Changes" : "Add Line"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {lineSpecs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Settings className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No lines configured</h3>
            <p className="mb-4 text-sm text-muted-foreground">Add slitter line specifications to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {lineSpecs.map((spec) => (
            <Card key={spec.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl">{spec.lineName}</CardTitle>
                  <CardDescription>Slitter Line Configuration</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(spec)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(spec.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex gap-2">
                    {spec.hrCapability && <Badge>HR</Badge>}
                    {spec.crCapability && <Badge variant="secondary">CR</Badge>}
                  </div>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Slit Width Range</TableCell>
                        <TableCell>
                          {spec.minSlitWidth} - {spec.maxSlitWidth} MM
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Max Knives</TableCell>
                        <TableCell>{spec.maxKnives}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Scrap Edge</TableCell>
                        <TableCell>
                          {spec.scrapEdgeMin} - {spec.scrapEdgeMax} MM per side
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Setup Cost</TableCell>
                        <TableCell>${spec.setupChangeCost}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Setup Time</TableCell>
                        <TableCell>{spec.setupTime} min</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
