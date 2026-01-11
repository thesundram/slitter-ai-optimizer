"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RMCoilTab } from "@/components/tabs/rm-coil-tab"
import { SalesOrderTab } from "@/components/tabs/sales-order-tab"
import { LineSpecTab } from "@/components/tabs/line-spec-tab"
import { OptimizerTab } from "@/components/tabs/optimizer-tab"
import { ForecastTab } from "@/components/tabs/forecast-tab"
import { SlitterProvider } from "@/lib/slitter-context"

export default function Home() {
  const [activeTab, setActiveTab] = useState("rm-coil")

  return (
    <SlitterProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="container mx-auto px-4 py-6 flex-1">
          {activeTab === "rm-coil" && <RMCoilTab />}
          {activeTab === "sales-order" && <SalesOrderTab />}
          {activeTab === "line-spec" && <LineSpecTab />}
          {activeTab === "optimizer" && <OptimizerTab />}
          {activeTab === "forecast" && <ForecastTab />}
        </main>
        <div className="container mx-auto px-4 mb-4">
          <Footer />
        </div>
      </div>
    </SlitterProvider>
  )
}
