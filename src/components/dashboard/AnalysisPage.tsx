import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function AnalysisPage() {
  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Página de Análises</h2>
          <p className="text-muted-foreground">
            Esta página está pronta para receber novos componentes de análise.
            Solicite as análises que deseja visualizar aqui.
          </p>
        </Card>
      </div>
    </div>
  );
}
