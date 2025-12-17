import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ProcessedKPI } from "@/types/kpi";
import { Badge } from "@/components/ui/badge";

interface DataTableProps {
  data: ProcessedKPI[];
}

export function DataTable({ data }: DataTableProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Dados Detalhados</h3>
        <p className="text-sm text-muted-foreground">
          Visualização completa dos KPIs
        </p>
      </div>

      <div className="overflow-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Assessor</TableHead>
              <TableHead className="font-semibold">Categoria</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Total</TableHead>
              <TableHead className="font-semibold">Meses com Dados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 20).map((item, index) => (
              <TableRow key={index} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  {item.assessor.split(" ").slice(0, 3).join(" ")}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status.toLowerCase().includes("realizado")
                        ? "default"
                        : "outline"
                    }
                    className={
                      item.status.toLowerCase().includes("realizado")
                        ? "bg-success/20 text-success hover:bg-success/30"
                        : "border-info text-info"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {item.total}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.monthlyData.slice(0, 3).map((m, i) => (
                      <span
                        key={i}
                        className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
                      >
                        {m.month}: {m.value}
                      </span>
                    ))}
                    {item.monthlyData.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{item.monthlyData.length - 3} mais
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data.length > 20 && (
        <p className="mt-4 text-sm text-muted-foreground text-center">
          Mostrando 20 de {data.length} registros
        </p>
      )}
    </Card>
  );
}
