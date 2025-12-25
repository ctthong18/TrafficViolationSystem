"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
    { day: "Mon", violations: 145 },
    { day: "Tue", violations: 132 },
    { day: "Wed", violations: 164 },
    { day: "Thu", violations: 182 },
    { day: "Fri", violations: 154 },
    { day: "Sat", violations: 98 },
    { day: "Sun", violations: 84 },
]

const chartConfig = {
    violations: {
        label: "Violations",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig

export function DashboardChart() {
    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                        dataKey="day"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                        dataKey="violations"
                        fill="var(--color-violations)"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}
