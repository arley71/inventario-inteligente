"use client"

import { KpiCards } from "@/components/dashboard/kpi-cards"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { UrgentList } from "@/components/dashboard/urgent-list"
import { QualityChart } from "@/components/dashboard/quality-chart"
import { RecentSales } from "@/components/dashboard/recent-sales"

export default function DashboardPage() {
  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground lg:text-2xl">Panel Principal</h2>
        <p className="text-sm text-muted-foreground">
          Resumen general del inventario y ventas del dia
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <KpiCards />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <SalesChart />
          </div>
          <div>
            <QualityChart />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <UrgentList />
          <RecentSales />
        </div>
      </div>
    </div>
  )
}
