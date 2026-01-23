import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { Building2, User } from "lucide-react";
import eclatLogo from "@/assets/eclat-xp-logo.png";
import eclatLogoDark from "@/assets/eclat-xp-logo-dark.png";

interface AssessorSelectorProps {
  assessors: string[];
  onSelectAssessor: (assessor: string | null) => void;
  isLoading: boolean;
}

export function AssessorSelector({ assessors, onSelectAssessor, isLoading }: AssessorSelectorProps) {
  const { resolvedTheme } = useTheme();
  
  // Filtrar "Socios" da lista
  const filteredAssessors = assessors.filter(a => a !== "Socios");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      {/* Logo */}
      <img 
        src={resolvedTheme === 'dark' ? eclatLogoDark : eclatLogo} 
        alt="Éclat Capital" 
        className="h-16 mb-8 object-contain"
      />
      
      {/* Título */}
      <h1 className="text-2xl font-bold mb-2 text-foreground">
        Selecione a visão do dashboard
      </h1>
      <p className="text-muted-foreground mb-8">
        Escolha um assessor para visualização individual ou o escritório para visão completa
      </p>
      
      {/* Grid de botões de assessores */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 max-w-4xl w-full">
        {filteredAssessors.map(assessor => (
          <Button 
            key={assessor}
            variant="outline"
            onClick={() => onSelectAssessor(assessor)}
            className="h-16 text-base font-medium hover:bg-primary/10 hover:border-primary transition-all flex items-center gap-2"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            {assessor.split(" ").slice(0, 2).join(" ")}
          </Button>
        ))}
      </div>
      
      {/* Botão Escritório (destacado) */}
      <Button 
        size="lg"
        onClick={() => onSelectAssessor(null)}
        className="h-16 px-12 text-xl font-bold bg-primary hover:bg-primary/90 flex items-center gap-3"
      >
        <Building2 className="h-6 w-6" />
        Escritório (Visão Completa)
      </Button>
      
      <p className="text-xs text-muted-foreground mt-6">
        Na visão de assessor, o filtro ficará bloqueado. Na visão do escritório, todos os filtros estarão disponíveis.
      </p>
    </div>
  );
}
