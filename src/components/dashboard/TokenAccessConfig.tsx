import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { LayoutGrid, TrendingUp, Target, Users, Lightbulb, Loader2 } from "lucide-react";
import { PageType } from "./PageToggle";

interface TokenAccessConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TokenData {
  id: string;
  assessor_name: string;
  token: string;
  is_active: boolean;
  allowed_screens: PageType[];
}

const ALL_SCREENS: { key: PageType; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutGrid className="h-4 w-4" /> },
  { key: "analysis", label: "Análise", icon: <TrendingUp className="h-4 w-4" /> },
  { key: "prospection", label: "Prospecção", icon: <Target className="h-4 w-4" /> },
  { key: "sprint", label: "Sprint", icon: <Users className="h-4 w-4" /> },
  { key: "tactics", label: "Táticas", icon: <Lightbulb className="h-4 w-4" /> },
];

const DEFAULT_SCREENS: PageType[] = ["dashboard", "analysis", "prospection", "sprint", "tactics"];

export function TokenAccessConfig({ isOpen, onClose }: TokenAccessConfigProps) {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [changes, setChanges] = useState<Map<string, PageType[]>>(new Map());

  useEffect(() => {
    if (isOpen) {
      loadTokens();
    }
  }, [isOpen]);

  const loadTokens = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("assessor_tokens")
        .select("id, assessor_name, token, is_active, allowed_screens")
        .eq("is_active", true)
        .order("assessor_name");

      if (error) throw error;

      const tokensData: TokenData[] = (data || []).map((t) => ({
        id: t.id,
        assessor_name: t.assessor_name,
        token: t.token,
        is_active: t.is_active ?? true,
        allowed_screens: (t.allowed_screens as PageType[]) || DEFAULT_SCREENS,
      }));

      setTokens(tokensData);
      setChanges(new Map());
    } catch (err) {
      console.error("Erro ao carregar tokens:", err);
      toast.error("Erro ao carregar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenToggle = (tokenId: string, screen: PageType) => {
    const token = tokens.find((t) => t.id === tokenId);
    if (!token) return;

    const currentScreens = changes.get(tokenId) || token.allowed_screens;
    let newScreens: PageType[];

    if (currentScreens.includes(screen)) {
      // Não permite remover a última tela
      if (currentScreens.length === 1) {
        toast.error("É necessário manter pelo menos uma tela habilitada");
        return;
      }
      newScreens = currentScreens.filter((s) => s !== screen);
    } else {
      newScreens = [...currentScreens, screen];
    }

    setChanges(new Map(changes).set(tokenId, newScreens));
  };

  const getScreensForToken = (tokenId: string, originalScreens: PageType[]): PageType[] => {
    return changes.get(tokenId) || originalScreens;
  };

  const handleSave = async () => {
    if (changes.size === 0) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      const updates = Array.from(changes.entries()).map(([id, screens]) => ({
        id,
        allowed_screens: screens,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("assessor_tokens")
          .update({ allowed_screens: update.allowed_screens })
          .eq("id", update.id);

        if (error) throw error;
      }

      toast.success("Configurações salvas com sucesso!");
      setChanges(new Map());
      onClose();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = changes.size > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⚙️ Configurar Acesso dos Assessores
          </DialogTitle>
          <DialogDescription>
            Defina quais telas cada assessor pode acessar via seu link individual.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum token ativo encontrado.
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Assessor</TableHead>
                  {ALL_SCREENS.map((screen) => (
                    <TableHead key={screen.key} className="text-center w-20">
                      <div className="flex flex-col items-center gap-1">
                        {screen.icon}
                        <span className="text-xs">{screen.label}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => {
                  const currentScreens = getScreensForToken(token.id, token.allowed_screens);
                  const hasTokenChanges = changes.has(token.id);

                  return (
                    <TableRow
                      key={token.id}
                      className={hasTokenChanges ? "bg-primary/5" : ""}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="truncate max-w-[160px]">
                            {token.assessor_name.split(" ").slice(0, 2).join(" ")}
                          </span>
                          {hasTokenChanges && (
                            <span className="text-xs text-primary">modificado</span>
                          )}
                        </div>
                      </TableCell>
                      {ALL_SCREENS.map((screen) => (
                        <TableCell key={screen.key} className="text-center">
                          <Checkbox
                            checked={currentScreens.includes(screen.key)}
                            onCheckedChange={() =>
                              handleScreenToggle(token.id, screen.key)
                            }
                            className="mx-auto"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto">
            <span>Legenda:</span>
            {ALL_SCREENS.map((s) => (
              <span key={s.key} className="flex items-center gap-1">
                {s.icon} {s.label}
              </span>
            ))}
          </div>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
