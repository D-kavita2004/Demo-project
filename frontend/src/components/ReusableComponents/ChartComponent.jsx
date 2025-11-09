"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ===================== 🧩 MOCK WORKFLOW DATA =====================
export const workflowData = [
  { date: "2025-10-01", total: 20, quality: 10, production: 5, approved: 5 },
  { date: "2025-10-05", total: 30, quality: 12, production: 10, approved: 8 },
  { date: "2025-10-10", total: 25, quality: 8, production: 9, approved: 8 },
  { date: "2025-10-15", total: 40, quality: 15, production: 10, approved: 15 },
  { date: "2025-10-20", total: 45, quality: 18, production: 12, approved: 15 },
  { date: "2025-10-25", total: 50, quality: 16, production: 14, approved: 20 },
  { date: "2025-10-30", total: 60, quality: 20, production: 15, approved: 25 },
  { date: "2025-11-01", total: 55, quality: 18, production: 14, approved: 23 },
  { date: "2025-11-03", total: 65, quality: 22, production: 18, approved: 25 },
  { date: "2025-11-05", total: 70, quality: 25, production: 20, approved: 25 },
]

// ===================== 🎨 CHART CONFIG =====================

const chartConfig = {
  total: { label: "Total Forms", color: "hsl(var(--chart-1))" },
  quality: { label: "Quality Review", color: "hsl(var(--chart-2))" },
  production: { label: "Production Review", color: "hsl(var(--chart-3))" },
  approved: { label: "Approved", color: "hsl(var(--chart-4))" },
}

// ===================== 📈 MAIN COMPONENT =====================
export function WorkflowChart() {
  const [timeRange, setTimeRange] = React.useState("Last 3 months")

  // Filter data based on selected range
  const filteredData = React.useMemo(() => {
    const now = new Date("2025-11-05") // Example current date
    const daysToSubtract =
      timeRange === "Last 7 days"
        ? 7
        : timeRange === "Last 30 days"
        ? 30
        : 90
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return workflowData.filter(
      (d) => new Date(d.date) >= startDate && new Date(d.date) <= now
    )
  }, [timeRange])

  return (
    <Card className="dark:bg-white dark:text-black md:w-[90%] mx-auto w-[100%]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Product Defectiveness Analysis</CardTitle>
          <CardDescription>
            Status distribution of forms ({timeRange})
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="Last 3 months">Last 3 months</SelectItem>
            <SelectItem value="Last 30 days">Last 30 days</SelectItem>
            <SelectItem value="Last 7 days">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              {Object.entries(chartConfig).map(([key, cfg]) => (
                <linearGradient
                  key={key}
                  id={`fill-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={cfg.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={cfg.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />

            <Area
              dataKey="approved"
              type="natural"
              fill="url(#fill-approved)"
              stroke="var(--color-approved)"
              stackId="a"
            />
            <Area
              dataKey="production"
              type="natural"
              fill="url(#fill-production)"
              stroke="var(--color-production)"
              stackId="a"
            />
            <Area
              dataKey="quality"
              type="natural"
              fill="url(#fill-quality)"
              stroke="var(--color-quality)"
              stackId="a"
            />
            <Area
              dataKey="total"
              type="natural"
              fill="url(#fill-total)"
              stroke="var(--color-total)"
              stackId="a"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
