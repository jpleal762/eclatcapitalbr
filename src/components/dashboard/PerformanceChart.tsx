import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";

interface PerformanceChartProps {
  data: { name: string; planned: number; realized: number; performance: number }[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const topData = data.slice(0, 8);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Performance por Assessor</h3>
        <p className="text-sm text-muted-foreground">
          Top assessores por realização
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(222, 47%, 22%)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(222, 47%, 22%)" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }}
              axisLine={{ stroke: "hsl(222, 47%, 22%)" }}
              tickLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 14%)",
                border: "1px solid hsl(222, 47%, 22%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 98%)",
              }}
              formatter={(value: number, name: string) => [
                value,
                name === "realized" ? "Realizado" : name === "planned" ? "Planejado" : name,
              ]}
            />
            <Bar dataKey="realized" name="realized" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {topData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.performance >= 100
                      ? "hsl(142, 76%, 45%)"
                      : entry.performance >= 70
                      ? "hsl(174, 72%, 46%)"
                      : entry.performance >= 50
                      ? "hsl(38, 92%, 50%)"
                      : "hsl(0, 84%, 60%)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
