"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

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

export interface OptimizationResult {
  patterns: SlittingPattern[]
  totalYield: number
  totalScrap: number
  ordersCovered: number
  totalOrders: number
}

interface SlitterContextType {
  coils: RMCoil[]
  setCoils: (coils: RMCoil[]) => void
  orders: SalesOrder[]
  setOrders: (orders: SalesOrder[]) => void
  lineSpecs: LineSpec[]
  setLineSpecs: (specs: LineSpec[]) => void
  optimizationResult: OptimizationResult | null
  setOptimizationResult: (result: OptimizationResult | null) => void
  weights: { w1: number; w2: number; w3: number; w4: number }
  setWeights: (weights: { w1: number; w2: number; w3: number; w4: number }) => void
}

const SlitterContext = createContext<SlitterContextType | undefined>(undefined)

export function SlitterProvider({ children }: { children: ReactNode }) {
  const [coils, setCoils] = useState<RMCoil[]>([])
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [lineSpecs, setLineSpecs] = useState<LineSpec[]>([
    {
      id: "1",
      lineName: "Line-1",
      minSlitWidth: 50,
      maxSlitWidth: 600,
      maxKnives: 12,
      scrapEdgeMin: 5,
      scrapEdgeMax: 10,
      setupChangeCost: 500,
      setupTime: 30,
      hrCapability: true,
      crCapability: true,
    },
    {
      id: "2",
      lineName: "Line-2",
      minSlitWidth: 100,
      maxSlitWidth: 600,
      maxKnives: 8,
      scrapEdgeMin: 5,
      scrapEdgeMax: 15,
      setupChangeCost: 400,
      setupTime: 25,
      hrCapability: true,
      crCapability: false,
    },
  ])
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [weights, setWeights] = useState({ w1: 40, w2: 35, w3: 15, w4: 10 })

  return (
    <SlitterContext.Provider
      value={{
        coils,
        setCoils,
        orders,
        setOrders,
        lineSpecs,
        setLineSpecs,
        optimizationResult,
        setOptimizationResult,
        weights,
        setWeights,
      }}
    >
      {children}
    </SlitterContext.Provider>
  )
}

export function useSlitter() {
  const context = useContext(SlitterContext)
  if (!context) {
    throw new Error("useSlitter must be used within a SlitterProvider")
  }
  return context
}
