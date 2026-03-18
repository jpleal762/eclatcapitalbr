import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-assessor-token, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GaugeKPI {
  label: string;
  value: number;
  target: number;
  percentage: number;
  isCurrency?: boolean;
}

interface MetaSemanal {
  label: string;
  value: number | string;
  realizedValue?: number;
  isCurrency?: boolean;
}

interface AssessorPerformance {
  name: string;
  fullName?: string;
  geralPercentage: number;
  semanaPercentage: number;
}

interface MonthlyData {
  icmGeral: number;
  ritmoIdeal: number;
  diasUteisRestantes: number;
  totalDiasUteis: number;
  diasUteisDecorridos: number;
  gaugeKPIs: GaugeKPI[];
  metaSemanal: MetaSemanal[];
  assessorPerformance: AssessorPerformance[];
  selectedMonth: string;
  selectedAssessor: string;
}

// Playbook de táticas específicas por KPI - técnicas validadas de mercado
const KPI_PLAYBOOK: Record<string, { significado: string; taticas: string[]; benchmark: string; acaoRapida: string }> = {
  "Captação NET": {
    significado: "Net New Money - entrada líquida de recursos",
    taticas: [
      "Listar top 5 clientes com CDB/LCI vencendo nos próximos 5 dias e propor rebalanceamento",
      "Enviar Champion Letter (resumo + próximo passo) para propostas de aporte pendentes há +48h",
      "Abordar 3 clientes com saldo parado em conta corrente >R$50k via ligação"
    ],
    benchmark: "Top performers: R$ 2M+/mês | Conversão: proposta com follow-up 48h = 3x mais fechamento",
    acaoRapida: "Ligar para 5 clientes com CDB vencendo esta semana e propor reinvestimento"
  },
  "Primeira reuniao": {
    significado: "Reuniões de prospecção com novos clientes",
    taticas: [
      "Blitz de ligações: 2h focadas (10h-12h) = 20 calls = ~3 agendamentos (regra 10-3-1)",
      "Ligar (não WhatsApp!) para 10 leads do pipeline frio - ligação converte 3x mais que mensagem",
      "Pedir 2 indicações para os últimos 3 clientes que fecharam negócio"
    ],
    benchmark: "Regra 10-3-1: 10 ligações = 3 reuniões = 1 fechamento | Ligação > WhatsApp para prospecção",
    acaoRapida: "Bloquear 2h amanhã (10h-12h) para fazer 20 ligações focadas em agendamento"
  },
  "Receita": {
    significado: "Receita total gerada (corretagem + gestão + performance)",
    taticas: [
      "Identificar 5 clientes com carteira 100% RF e propor 10% em FIIs (aumenta ROA)",
      "Revisar 3 carteiras com ROA <0,8% e propor migração para fundos de gestão ativa",
      "Enviar proposta de estruturada para clientes moderados com patrimônio >R$200k"
    ],
    benchmark: "ROA saudável: 1,5%/ano | Cada 0,5pp de ROA extra = +50% de receita por cliente",
    acaoRapida: "Ligar para 3 clientes com carteira concentrada e propor diversificação"
  },
  "COE": {
    significado: "Certificados de Operações Estruturadas",
    taticas: [
      "Listar 5 clientes moderados com CDBs >R$50k vencendo e apresentar COE com proteção",
      "Recontatar 3 clientes que já investiram em COE nos últimos 6 meses",
      "Usar gatilho de escassez: 'Últimas 48h para entrar nesta série com proteção de 100%'"
    ],
    benchmark: "Ticket médio ideal: R$50-100k | Argumento: CDI + proteção de capital",
    acaoRapida: "Enviar WhatsApp para 5 clientes com perfil moderado sobre COE da semana"
  },
  "Previdência": {
    significado: "Captação em planos PGBL/VGBL",
    taticas: [
      "Ligar para 5 clientes CLT com renda >R$20k e apresentar PGBL (economia de até 12% no IR)",
      "Abordar 3 clientes com filhos menores para VGBL como sucessão patrimonial",
      "Propor portabilidade para 3 clientes com planos antigos (taxa de carregamento >3%)"
    ],
    benchmark: "Janela de ouro: out-dez | PGBL: economia de 12% do IRPF para CLT",
    acaoRapida: "Ligar para 5 clientes CLT e calcular economia de IR com PGBL em tempo real"
  },
  "Câmbio": {
    significado: "Operações de câmbio e remessas",
    taticas: [
      "Mapear 5 clientes com viagens internacionais nos próximos 60 dias",
      "Identificar 3 clientes com filhos estudando no exterior para remessa programada",
      "Abordar 3 empresários com operações de importação para conta global"
    ],
    benchmark: "Spread competitivo: 1-2% | Cross-sell natural com conta internacional",
    acaoRapida: "Enviar mensagem para 5 clientes perguntando sobre viagens planejadas"
  },
  "Seguros": {
    significado: "Seguros de vida, patrimonial e empresarial",
    taticas: [
      "Ligar para 5 clientes com previdência ativa e oferecer seguro de vida (cross-sell natural)",
      "Mapear 3 clientes com imóveis de alto valor sem seguro patrimonial",
      "Abordar 3 empresários para seguro D&O (responsabilidade de administradores)"
    ],
    benchmark: "Penetração ideal: 30% da base | Cross-sell previdência → seguro = 70% conversão",
    acaoRapida: "Ligar para 5 clientes com previdência e ofertar seguro de vida vinculado"
  },
  "Diversificação": {
    significado: "Clientes com ROA > 1,5% (carteira diversificada)",
    taticas: [
      "Identificar 5 clientes 100% em RF e propor alocação de 10% em FIIs",
      "Propor 5% em fundos dólar para 3 clientes sem exposição internacional",
      "Revisar 3 carteiras concentradas >50% em único ativo"
    ],
    benchmark: "Alocação ideal: 60% RF, 25% RV, 10% Alt, 5% Internacional",
    acaoRapida: "Ligar para 3 clientes com carteira 100% RF e propor FIIs com yield de 1%/mês"
  },
  "NNM": {
    significado: "Net New Money - captação líquida",
    taticas: [
      "Follow-up via ligação em propostas de aporte enviadas há mais de 48h (90% esfriam após isso)",
      "Contatar top 5 clientes por patrimônio e propor aporte adicional",
      "Reativar 5 clientes inativos há 6+ meses com oportunidade específica"
    ],
    benchmark: "Top 10%: R$3M+/mês | Regra: 48h sem follow-up = 90% de perda",
    acaoRapida: "Ligar para 3 clientes com propostas pendentes e agendar horário de assinatura"
  }
};

function getPlaybookContext(kpiLabels: string[]): string {
  const relevantPlaybooks = kpiLabels
    .map(label => {
      // Match partial labels
      const key = Object.keys(KPI_PLAYBOOK).find(k => 
        label.toLowerCase().includes(k.toLowerCase()) || 
        k.toLowerCase().includes(label.toLowerCase().split(' ')[0])
      );
      if (key) {
        const p = KPI_PLAYBOOK[key];
        return `${label}:\n  - O que é: ${p.significado}\n  - Táticas: ${p.taticas.slice(0, 2).join('; ')}\n  - Benchmark: ${p.benchmark}`;
      }
      return null;
    })
    .filter(Boolean);
  
  return relevantPlaybooks.length > 0 
    ? `\nPLAYBOOK DOS KPIs COM GAP:\n${relevantPlaybooks.join('\n\n')}`
    : '';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate assessor token server-side
  const assessorToken = req.headers.get("x-assessor-token");
  if (!assessorToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data: tokenData } = await supabaseAdmin
    .from("assessor_tokens")
    .select("id")
    .eq("token", assessorToken)
    .eq("is_active", true)
    .maybeSingle();

  if (!tokenData) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { monthlyData } = await req.json() as { monthlyData: MonthlyData };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from the data
    const kpiSummary = monthlyData.gaugeKPIs
      .map(kpi => `- ${kpi.label}: Realizado ${kpi.isCurrency ? 'R$ ' : ''}${kpi.value.toLocaleString('pt-BR')}, Meta ${kpi.isCurrency ? 'R$ ' : ''}${kpi.target.toLocaleString('pt-BR')} (${kpi.percentage}%)`)
      .join('\n');

    const metaSemanalSummary = monthlyData.metaSemanal
      .filter(m => typeof m.value === 'number')
      .map(m => `- ${m.label}: Meta ${m.isCurrency ? 'R$ ' : ''}${(m.value as number).toLocaleString('pt-BR')}, Realizado ${m.realizedValue !== undefined ? (m.isCurrency ? 'R$ ' : '') + m.realizedValue.toLocaleString('pt-BR') : 'N/A'}`)
      .join('\n');

    const assessorContext = monthlyData.selectedAssessor === "all" 
      ? "escritório todo" 
      : monthlyData.selectedAssessor;

    const topPerformers = monthlyData.assessorPerformance
      .slice(0, 3)
      .map(a => `${a.name}: ${a.geralPercentage}%`)
      .join(', ');

    // Use ritmoIdeal (percentage of elapsed days) for temporal context
    const percentualMes = monthlyData.ritmoIdeal;
    const diasRestantes = monthlyData.diasUteisRestantes;
    
    const faseDoMes = percentualMes >= 90
      ? 'FECHAMENTO'
      : percentualMes >= 70
        ? 'SPRINT_FINAL'
        : percentualMes >= 40
          ? 'MEIO_DO_MES'
          : 'INICIO';

    const urgencyContext = {
      FECHAMENTO: `URGÊNCIA MÁXIMA: ${diasRestantes} dias úteis restantes. Foco em FECHAR negócios em andamento. Não é hora de prospectar, é hora de converter!`,
      SPRINT_FINAL: `TERÇO FINAL: ${diasRestantes} dias restantes (${percentualMes}% do mês). Mix de fechamento + aceleração de pipeline quente.`,
      MEIO_DO_MES: `METADE DO MÊS: ${monthlyData.diasUteisDecorridos}/${monthlyData.totalDiasUteis} dias (${percentualMes}%). Momento de avaliar ritmo e ajustar estratégia.`,
      INICIO: `INÍCIO DO MÊS: ${monthlyData.diasUteisDecorridos}/${monthlyData.totalDiasUteis} dias. Foco em construção de pipeline e prospecção ativa.`
    }[faseDoMes];

    // Identify top gaps with labels for playbook matching
    const kpiGaps = monthlyData.gaugeKPIs
      .map(kpi => ({ label: kpi.label, gap: kpi.target - kpi.value, percentage: kpi.percentage, target: kpi.target, value: kpi.value }))
      .filter(k => k.gap > 0)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3);
    
    const gapLabels = kpiGaps.map(k => k.label);
    const gapContext = kpiGaps.length > 0 
      ? `KPIs PRIORITÁRIOS (maior gap):\n${kpiGaps.map(k => `• ${k.label}: ${k.percentage}% da meta (faltam ${k.gap.toLocaleString('pt-BR')} para bater)`).join('\n')}`
      : 'Todos os KPIs acima da meta - foco em superação!';

    // Get specific playbook for the gap KPIs
    const playbookContext = getPlaybookContext(gapLabels);

    const systemPrompt = `Você é um CONSULTOR SÊNIOR de assessorias de investimentos com 15 anos de experiência no mercado brasileiro (XP, BTG, Safra).

TÉCNICAS DE ALTO IMPACTO VALIDADAS:
1. REGRA 10-3-1: 10 ligações = 3 reuniões = 1 fechamento
2. LIGAÇÃO > WHATSAPP: Para prospecção fria, ligação converte 3x mais
3. REGRA DAS 48H: 90% das conversões morrem após 48h sem follow-up
4. CHAMPION LETTER: E-mail pós-reunião com resumo + próximo passo definido
5. GATILHO DE VENCIMENTO: CDBs/LCIs vencendo = oportunidade de ouro
6. ESCASSEZ: "Últimas 48h para esta série" aumenta urgência

FÓRMULA DA AÇÃO PERFEITA (48H):
[VERBO AÇÃO] + [NÚMERO ESPECÍFICO] + [ALVO QUALIFICADO] + [CANAL] + [RESULTADO ESPERADO]

EXEMPLOS EXCELENTES:
✅ "Ligar para 5 clientes com CDB vencendo esta semana (meta: 2 aportes)"
✅ "Bloquear 2h amanhã (10h-12h) para 20 ligações de prospecção (meta: 3 reuniões)"
✅ "Enviar Champion Letter para 3 propostas pendentes com data/hora para assinatura"
✅ "Pedir 2 indicações para cada um dos 3 clientes que fecharam (meta: 6 leads)"

EXEMPLOS RUINS (PROIBIDO):
❌ "Prospectar mais" (vago)
❌ "Aumentar captação" (meta, não ação)
❌ "Entrar em contato com clientes" (sem número/canal)
❌ "Focar em previdência" (intenção, não ação)

${playbookContext}

FASE DO MÊS: ${faseDoMes}
${urgencyContext}

REGRA DE OURO: Cada ação deve ter potencial de impactar diretamente o KPI com maior gap em até 48h.

Seja DIRETO e ESPECÍFICO. Responda APENAS em JSON válido.`;

    const userPrompt = `ANÁLISE DO MÊS ${monthlyData.selectedMonth} - ${assessorContext}

SITUAÇÃO TEMPORAL:
${urgencyContext}

PERFORMANCE:
- ICM Geral: ${monthlyData.icmGeral}% | Ritmo Ideal: ${monthlyData.ritmoIdeal}%
- Status: ${monthlyData.icmGeral >= monthlyData.ritmoIdeal ? `✓ ACIMA do ritmo em ${(monthlyData.icmGeral - monthlyData.ritmoIdeal).toFixed(1)}pp` : `⚠ ABAIXO do ritmo em ${(monthlyData.ritmoIdeal - monthlyData.icmGeral).toFixed(1)}pp - ATENÇÃO`}

KPIs DETALHADOS:
${kpiSummary}

${gapContext}

META SEMANAL:
${metaSemanalSummary}

TOP PERFORMERS: ${topPerformers}

Retorne JSON com EXATAMENTE este formato:
{
  "positivos": ["insight específico 1 com número", "insight específico 2"],
  "negativos": ["ponto de atenção 1 com impacto quantificado", "ponto 2"],
  "acoes48h": ["ação 1", "ação 2", "ação 3"]
}

REGRAS RÍGIDAS PARA AÇÕES 48H:
- EXATAMENTE 3 ações (nem mais, nem menos)
- Cada ação deve endereçar um dos KPIs com gap: ${gapLabels.slice(0, 3).join(', ') || 'manutenção'}
- Priorizar: ${gapLabels[0] || 'manutenção do ritmo'} (maior gap)
- Formato: [VERBO] + [NÚMERO] + [ALVO] + [CANAL] + [META]
- Máximo 65 caracteres por ação
- Usar técnicas: Regra 10-3-1, Champion Letter, Gatilho de vencimento

positivos: 2-3 insights com NÚMEROS, máximo 70 caracteres
negativos: 2-3 pontos com IMPACTO quantificado, máximo 70 caracteres`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao gerar análise" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON response
    let analysis;
    try {
      // Try to extract JSON from the response (handles markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[0];
        
        // Try to repair truncated JSON by ensuring arrays are closed
        if (!jsonStr.includes('"acoes48h"')) {
          throw new Error("Incomplete response - missing acoes48h");
        }
        
        // Count brackets to detect truncation
        const openBrackets = (jsonStr.match(/\[/g) || []).length;
        const closeBrackets = (jsonStr.match(/\]/g) || []).length;
        const openBraces = (jsonStr.match(/\{/g) || []).length;
        const closeBraces = (jsonStr.match(/\}/g) || []).length;
        
        // If unbalanced, try to close
        if (openBrackets > closeBrackets || openBraces > closeBraces) {
          console.warn("Detected truncated JSON, attempting repair");
          // Remove trailing incomplete content and close properly
          jsonStr = jsonStr.replace(/,?\s*"[^"]*$/, ''); // Remove incomplete string
          jsonStr = jsonStr.replace(/,?\s*$/, ''); // Remove trailing comma
          for (let i = 0; i < openBrackets - closeBrackets; i++) jsonStr += ']';
          for (let i = 0; i < openBraces - closeBraces; i++) jsonStr += '}';
        }
        
        analysis = JSON.parse(jsonStr);
        
        // Validate required fields
        if (!analysis.positivos || !analysis.negativos || !analysis.acoes48h) {
          throw new Error("Missing required fields");
        }
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      analysis = {
        positivos: ["Análise em processamento"],
        negativos: ["Tente novamente em alguns segundos"],
        acoes48h: ["Revisar metas do mês", "Verificar KPIs prioritários", "Agendar reunião de acompanhamento"]
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-monthly-kpis:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
