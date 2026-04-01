"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useInventory } from "@/lib/inventory-context"

export function QualityChart() {
  const { revuelteria } = useInventory()

  const fresh = revuelteria.filter((p) => p.freshness === "fresco" || (!p.freshness && !p.batches?.some(b => b.freshness === "danado"))).length
  const damaged = revuelteria.filter((p) => p.freshness === "danado" || p.batches?.some(b => b.freshness === "danado")).length
  const total = fresh + damaged

  const data = [
    { name: "Bueno", value: fresh, color: "var(--primary)" },
    { name: "Malo", value: damaged, color: "var(--destructive)" },
  ].filter((d) => d.value > 0)

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">Calidad Perecederos</h3>
        <p className="text-xs text-muted-foreground">Estado de frutas y verduras</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="h-36 w-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: 13,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-2.5">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-card-foreground">
                {item.name}: <span className="font-semibold">{total > 0 ? Math.round((item.value / total) * 100) : 0}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
