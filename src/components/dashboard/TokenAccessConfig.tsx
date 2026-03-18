import { useState, useEffect } from "react";
import { getAuthedClient } from "@/integrations/supabase/authedClient";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  LayoutGrid, 
  TrendingUp, 
  Target, 
  Users, 
  Lightbulb, 
  Loader2,
  Layers,
  RotateCcw,
  Maximize2,
  Smartphone,
  Monitor,
  CalendarDays,
  Moon,
  Sun,
  Edit3,
  Download
} from "lucide-react";
import { useTheme } from "next-themes";
import { PageType } from "./PageToggle";
import { Separator } from "@/components/ui/separator";
import { setOpenMonth as saveOpenMonth } from "@/lib/permissions";

interface TokenAccessConfigProps {
  isOpen: boolean;
  onClose: () => void;
  isPageRotationEnabled: boolean;
  onPageRotationChange: (enabled: boolean) => void;
  isCardFlippingEnabled: boolean;
  onCardFlippingChange: (enabled: boolean) => void;
  isFullscreen: boolean;
  onFullscreenChange: (enabled: boolean) => void;
  viewMode: 'desktop' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
  openMonth: string | null;
  onOpenMonthChange: (month: string | null) => void;
  onEditProduction: () => void;
  onExportDatabase: () => void;
}

interface TokenData {
  id: string;
  assessor_name: string;
  token: string;
  is_active: boolean;
  allowed_screens: PageType[];
  role: string;
}

// Generate month options for the dropdown
const generateMonthOptions = () => {
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const currentYear = new Date().getFullYear();
  const options: { value: string; label: string }[] = [];
  for (let y = currentYear - 1; y <= currentYear + 1; y++) {
    const shortYear = y.toString().slice(-2);
    for (const m of months) {
      options.push({ value: `${m}-${shortYear}`, label: `${m.charAt(0).toUpperCase() + m.slice(1)}/${shortYear}` });
    }
  }
  return options;
};

const ALL_SCREENS: { key: PageType; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutGrid className="h-4 w-4" /> },
  { key: "analysis", label: "Análise", icon: <TrendingUp className="h-4 w-4" /> },
  { key: "sprint", label: "Sprint", icon: <Users className="h-4 w-4" /> },
];

const DEFAULT_SCREENS: PageType[] = ["dashboard", "analysis", "sprint"];

export function TokenAccessConfig({ 
  isOpen, 
  onClose,
  isPageRotationEnabled,
  onPageRotationChange,
  isCardFlippingEnabled,
  onCardFlippingChange,
  isFullscreen,
  onFullscreenChange,
  viewMode,
  onViewModeChange,
  openMonth,
  onOpenMonthChange,
  onEditProduction,
  onExportDatabase,
}: TokenAccessConfigProps) {
  const { theme, setTheme } = useTheme();
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
        .select("id, assessor_name, token, is_active, allowed_screens, role")
        .eq("is_active", true)
        .order("assessor_name");

      if (error) throw error;

      const tokensData: TokenData[] = (data || []).map((t) => ({
        id: t.id,
        assessor_name: t.assessor_name,
        token: t.token,
        is_active: t.is_active ?? true,
        allowed_screens: (t.allowed_screens as PageType[]) || DEFAULT_SCREENS,
        role: (t as any).role || 'socio',
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

  const handleFullscreenToggle = (enabled: boolean) => {
    onFullscreenChange(enabled);
    if (enabled) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const hasChanges = changes.size > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⚙️ Configurações do Dashboard
          </DialogTitle>
          <DialogDescription>
            Controle as automações e defina o acesso dos assessores.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Dashboard Controls Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Controles do Dashboard
            </h3>
            
            <div className="grid gap-4 p-4 bg-muted/30 rounded-lg">
              {/* Page Rotation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="page-rotation" className="font-medium">Rotação automática de páginas</Label>
                    <p className="text-xs text-muted-foreground">Alterna entre telas a cada 90 segundos</p>
                  </div>
                </div>
                <Switch
                  id="page-rotation"
                  checked={isPageRotationEnabled}
                  onCheckedChange={onPageRotationChange}
                />
              </div>

              {/* Card Flipping */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="card-flipping" className="font-medium">Flip automático de cards</Label>
                    <p className="text-xs text-muted-foreground">Gira os cards a cada 30 segundos (inclui IA)</p>
                  </div>
                </div>
                <Switch
                  id="card-flipping"
                  checked={isCardFlippingEnabled}
                  onCheckedChange={onCardFlippingChange}
                />
              </div>

              {/* Fullscreen */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Maximize2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="fullscreen" className="font-medium">Modo tela cheia</Label>
                    <p className="text-xs text-muted-foreground">Oculta sidebar e expande o conteúdo</p>
                  </div>
                </div>
                <Switch
                  id="fullscreen"
                  checked={isFullscreen}
                  onCheckedChange={handleFullscreenToggle}
                />
              </div>

              {/* View Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {viewMode === 'desktop' ? (
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <Label className="font-medium">Visualização</Label>
                    <p className="text-xs text-muted-foreground">Simula visualização em diferentes dispositivos</p>
                  </div>
                </div>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'desktop' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-3"
                    onClick={() => onViewModeChange('desktop')}
                  >
                    <Monitor className="h-3 w-3 mr-1" />
                    Desktop
                  </Button>
                  <Button
                    variant={viewMode === 'mobile' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-3"
                    onClick={() => onViewModeChange('mobile')}
                  >
                    <Smartphone className="h-3 w-3 mr-1" />
                    Mobile
                  </Button>
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <Label htmlFor="theme-toggle" className="font-medium">Tema escuro</Label>
                    <p className="text-xs text-muted-foreground">Alterna entre tema claro e escuro</p>
                  </div>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>

              {/* Edit Production */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit3 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="font-medium">Editar Produção</Label>
                    <p className="text-xs text-muted-foreground">Abre o modal de edição de produção</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-7" onClick={onEditProduction}>
                  Abrir
                </Button>
              </div>

              {/* Export Database */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="font-medium">Baixar Base de Dados</Label>
                    <p className="text-xs text-muted-foreground">Exporta todos os dados em XLSX</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-7" onClick={onExportDatabase}>
                  Baixar
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Open Month Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Mês Aberto para Lançamentos
            </h3>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Mês aberto</Label>
                  <p className="text-xs text-muted-foreground">Sócios só podem criar/editar/excluir dados dentro deste mês</p>
                </div>
                <Select
                  value={openMonth || ""}
                  onValueChange={async (value) => {
                    const success = await saveOpenMonth(value, "Admin");
                    if (success) {
                      onOpenMonthChange(value);
                      toast.success(`Mês aberto alterado para ${value}`);
                    } else {
                      toast.error("Erro ao alterar mês aberto");
                    }
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateMonthOptions().map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Token Access Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Users className="h-4 w-4" />
              Acesso dos Assessores
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum token ativo encontrado.
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Assessor</TableHead>
                      <TableHead className="text-center w-16">
                        <span className="text-xs">Role</span>
                      </TableHead>
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
                          <TableCell className="text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${token.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                              {token.role === 'admin' ? 'Admin' : 'Sócio'}
                            </span>
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
          </div>
        </div>

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
