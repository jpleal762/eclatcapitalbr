import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

interface MonthlyChartProps {
  data: { month: string; planned: number; realized: number }[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Evolução Mensal</h3>
        <p className="text-sm text-muted-foreground">
          Comparativo planejado vs realizado por mês
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(222, 47%, 22%)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(222, 47%, 22%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(222, 47%, 22%)" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 14%)",
                border: "1px solid hsl(222, 47%, 22%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 98%)",
              }}
              cursor={{ fill: "hsla(174, 72%, 46%, 0.1)" }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => (
                <span style={{ color: "hsl(215, 20%, 65%)" }}>
                  {value === "planned" ? "Planejado" : "Realizado"}
                </span>
              )}
            />
            <Bar
              dataKey="planned"
              name="planned"
              fill="hsl(199, 89%, 48%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="realized"
              name="realized"
              fill="hsl(174, 72%, 46%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
