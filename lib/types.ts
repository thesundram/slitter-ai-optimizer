export interface RMCoil {
  id: string
  coilId: string
  type: "HR" | "CR"
  grade: string
  thickness: number
  width: number
  weight: number
  innerDiameter?: number
  outerDiameter?: number
  lineCompatibility: ("Line-1" | "Line-2")[]
}

export interface SalesOrder {
  id: string
  orderId: string
  type: "HR" | "CR"
  requiredWidth: number
  weight: number
  grade: string
  thickness: number
  priority: "High" | "Medium" | "Low"
  dueDate: string
  widthTolerance: number
}

export interface LineSpec {
  id: string
  lineName: string
  minSlitWidth: number
  maxSlitWidth: number
  maxKnives: number
  scrapEdgeMin: number
  scrapEdgeMax: number
  setupChangeCost: number
  setupTime: number
  hrCapability: boolean
  crCapability: boolean
}

export interface SlittingPattern {
  id: string
  coilId: string
  patternId: string
  slitWidths: { width: number; orderId?: string; quantity: number }[]
  scrapWidth: number
  yieldPercent: number
  score: number
  assignedLine?: "Line-1" | "Line-2"
}
