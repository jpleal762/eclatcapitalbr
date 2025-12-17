import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card } from "@/components/ui/card";

interface CategoryChartProps {
  data: { name: string; value: number; color: string }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Distribuição por Categoria</h3>
        <p className="text-sm text-muted-foreground">
          Total por tipo de KPI
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 14%)",
                border: "1px solid hsl(222, 47%, 22%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 98%)",
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => (
                <span style={{ color: "hsl(215, 20%, 65%)", fontSize: "12px" }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
