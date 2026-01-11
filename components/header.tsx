"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Scissors, Package, FileText, Settings, Cpu, TrendingUp } from "lucide-react"

interface HeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString())
  }, [])

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Scissors className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Slitter Optimization</h1>
              <p className="text-xs text-muted-foreground">Steel Industries Production Planning</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Shift: Day</span>
            <span className="h-4 w-px bg-border" />
            <span>Date: {currentDate}</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-12 w-full justify-start gap-1 rounded-none border-b-0 bg-transparent p-0">
            <TabsTrigger
              value="rm-coil"
              className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none border-b-2 border-transparent px-4 py-3 font-medium"
            >
              <Package className="mr-2 h-4 w-4" />
              RM Coil
            </TabsTrigger>
            <TabsTrigger
              value="sales-order"
              className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none border-b-2 border-transparent px-4 py-3 font-medium"
            >
              <FileText className="mr-2 h-4 w-4" />
              Sales Order
            </TabsTrigger>
            <TabsTrigger
              value="line-spec"
              className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none border-b-2 border-transparent px-4 py-3 font-medium"
            >
              <Settings className="mr-2 h-4 w-4" />
              Line Spec
            </TabsTrigger>
            <TabsTrigger
              value="optimizer"
              className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none border-b-2 border-transparent px-4 py-3 font-medium"
            >
              <Cpu className="mr-2 h-4 w-4" />
              Optimizer
            </TabsTrigger>
            <TabsTrigger
              value="forecast"
              className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none border-b-2 border-transparent px-4 py-3 font-medium"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Forecast
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  )
}
