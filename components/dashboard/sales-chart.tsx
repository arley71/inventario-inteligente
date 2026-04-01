"use client"

import { useMemo } from "react"
import { useInventory } from "@/lib/inventory-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

function parseDate(dateStr: string): Date {
  const parts = dateStr.split("/")
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    return new Date(year, month, day)
  }
  return new Date(dateStr + "T00:00:00")
}

export function SalesChart() {
  const { sales } = useInventory()

  const weeklySalesData = useMemo(() => {
    const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
    
    // Generar fechas de los ultimos 7 dias a medianoche
    const data = Array(7).fill(0).map((_, i) => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - (6 - i))
      return {
        timestamp: d.getTime(),
        day: days[d.getDay()],
        ventas: 0
      }
    })

    sales.forEach(sale => {
      const saleDate = parseDate(sale.date)
      saleDate.setHours(0, 0, 0, 0)
      const ts = saleDate.getTime()
      
      const match = data.find(d => d.timestamp === ts)
      if (match) {
        match.ventas += sale.total
      }
    })

    return data
  }, [sales])

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">Ventas Semanales</h3>
        <p className="text-xs text-muted-foreground">Tendencia de los ultimos 7 dias</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklySalesData} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickFormatter={(v) => `COP $${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: 13,
              }}
              formatter={(value: number) => [`COP $${value.toLocaleString("es-CO")}`, "Ventas"]}
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            />
            <Bar
              dataKey="ventas"
              fill="var(--primary)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
