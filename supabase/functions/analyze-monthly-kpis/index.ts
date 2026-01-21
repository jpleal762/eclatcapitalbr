import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

// Playbook de táticas específicas por KPI - conhecimento de mercado de assessoria
const KPI_PLAYBOOK: Record<string, { significado: string; taticas: string[]; benchmark: string }> = {
  "Captação NET": {
    significado: "Net New Money - entrada líquida de recursos",
    taticas: [
      "Follow-up em propostas de aporte pendentes",
      "Contatar clientes com CDB/LCI vencendo para reinvestir",
      "Abordar top 10 clientes por patrimônio para aporte adicional",
      "Converter saldo em conta corrente em investimentos"
    ],
    benchmark: "Top performers: R$ 2M+/mês por carteira de 50 clientes"
  },
  "Primeira reuniao": {
    significado: "Reuniões de prospecção com novos clientes",
    taticas: [
      "Blitz de ligações: 30 calls em 2h = ~5 agendamentos",
      "Reativar leads quentes dos últimos 30 dias via WhatsApp",
      "Pedir 2 indicações para cada cliente satisfeito",
      "Agendar cafés com contatos de networking pendentes"
    ],
    benchmark: "Conversão média: 10 ligações = 1 reunião"
  },
  "Receita": {
    significado: "Receita total gerada (corretagem + gestão + performance)",
    taticas: [
      "Propor rebalanceamento para produtos de maior fee",
      "Identificar clientes para migração RF → Fundos",
      "Revisar carteiras com baixo giro para oportunidades",
      "Oferecer estruturadas para clientes com perfil"
    ],
    benchmark: "ROA saudável: 1,5% ao ano sobre AuC"
  },
  "COE": {
    significado: "Certificados de Operações Estruturadas",
    taticas: [
      "Listar clientes moderados com CDBs vencendo",
      "Apresentar COE como alternativa ao CDI com proteção",
      "Recontatar clientes que já investiram em COE",
      "Usar cases: 'Cliente X teve retorno de Y% em Z meses'"
    ],
    benchmark: "Ticket médio ideal: R$ 50-100k por operação"
  },
  "Previdência": {
    significado: "Captação em planos PGBL/VGBL",
    taticas: [
      "Identificar clientes CLT para benefício fiscal PGBL (12% IRPF)",
      "Abordar clientes com dependentes para sucessão",
      "Propor portabilidade de planos antigos com taxas altas",
      "Campanha de aporte extra em outubro-dezembro"
    ],
    benchmark: "Janela de ouro: out-dez (dedução IRPF)"
  },
  "Câmbio": {
    significado: "Operações de câmbio e remessas",
    taticas: [
      "Mapear clientes com viagens internacionais marcadas",
      "Oferecer conta global para clientes frequentes",
      "Identificar clientes com filhos estudando no exterior",
      "Abordar empresários com operações de importação"
    ],
    benchmark: "Spread competitivo: 1-2% sobre comercial"
  },
  "Seguros": {
    significado: "Seguros de vida, patrimonial e empresarial",
    taticas: [
      "Mapear clientes sem seguro de vida com dependentes",
      "Oferecer seguro patrimonial para imóveis de alto valor",
      "Abordar empresários para seguro empresarial/D&O",
      "Cross-sell: cliente que fez previdência → seguro de vida"
    ],
    benchmark: "Penetração ideal: 30% da base com seguro"
  },
  "Diversificação": {
    significado: "Clientes com ROA > 1,5% (carteira diversificada)",
    taticas: [
      "Propor 10% em FIIs para clientes 100% em RF",
      "Apresentar multimercado para conservadores",
      "Oferecer proteção cambial via fundos dólar",
      "Revisar concentração excessiva em único ativo"
    ],
    benchmark: "Ideal: 60% RF, 25% RV, 10% Alt, 5% Internacional"
  },
  "NNM": {
    significado: "Net New Money - captação líquida",
    taticas: [
      "Follow-up em propostas de aporte pendentes",
      "Contatar clientes com aplicações vencendo",
      "Abordar top 10 por patrimônio para novo aporte",
      "Campanha de aporte para clientes inativos"
    ],
    benchmark: "Top 10%: R$ 3M+/mês de captação líquida"
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

    const systemPrompt = `Você é um CONSULTOR SÊNIOR de assessorias de investimentos com 15 anos de experiência no mercado brasileiro, especialista em gestão de metas e performance comercial.

CONTEXTO DO NEGÓCIO:
- Assessoria de investimentos vinculada à XP
- Modelo de remuneração: comissão sobre produtos + taxa de gestão
- Foco em clientes PF de alta renda e PJ

MÉTRICAS E SIGNIFICADOS:
- Captação/NNM: Entrada líquida de recursos (aportes - resgates)
- Receita: Receita gerada via corretagem, gestão, performance
- Primeiras Reuniões: Prospecção ativa - motor de crescimento
- COE: Estruturadas com proteção - bom para moderados
- Previdência: PGBL/VGBL - benefício fiscal + sucessão
- Câmbio/Seguros: Cross-sell - aumenta receita por cliente
- Diversificação: ROA > 1,5% indica carteira saudável

BOAS PRÁTICAS DE ALTA PERFORMANCE:
1. Regra 80/20: 80% do tempo nos 20% de maior potencial
2. Follow-up em 48h: Lead quente perde 90% de conversão após isso
3. Blitz de ligações: 2h focadas = 30 ligações = 3-5 reuniões
4. Cross-sell progressivo: RF → FII → RV → Internacional
5. Campanha de vencimentos: CDBs/LCIs vencendo = oportunidade de reaplicação
6. Referral: Cada cliente satisfeito pode indicar 2-3 novos
7. Revisão de carteira: Motivo legítimo para contato e identificação de oportunidades

${playbookContext}

REGRAS CRÍTICAS PARA AÇÕES 48H:
- OBRIGATÓRIO: Incluir NÚMEROS específicos (ex: "Ligar para 5 clientes", "Agendar 3 reuniões")
- OBRIGATÓRIO: Incluir CANAL de ação (ligação, WhatsApp, e-mail, Calendly)
- OBRIGATÓRIO: Vincular ao KPI com problema (não ações genéricas)
- OBRIGATÓRIO: Ação deve ser executável em 48h com resultado mensurável
- PROIBIDO: "Aumentar X", "Focar em Y", "Melhorar Z" (isso não é ação, é desejo)

EXEMPLOS DE AÇÕES EXCELENTES:
✅ "Ligar para 8 clientes com CDB vencendo esta semana"
✅ "Enviar WhatsApp para top 10 inativos com oportunidade FII 1%/mês"
✅ "Agendar 3 revisões de carteira via Calendly para diversificação"
✅ "Follow-up em 5 propostas de previdência pendentes"
✅ "Pedir 2 indicações para cada um dos 3 clientes que fecharam este mês"

EXEMPLOS DE AÇÕES RUINS (NÃO USAR):
❌ "Prospectar mais clientes" (vago, sem número)
❌ "Aumentar captação" (é meta, não ação)
❌ "Focar em previdência" (intenção, não ação)
❌ "Melhorar performance" (não é executável)

FASE ATUAL DO MÊS: ${faseDoMes}
${faseDoMes === 'FECHAMENTO' ? 'FOCO: Fechar negócios em andamento, follow-up de propostas, última chance!' : ''}
${faseDoMes === 'SPRINT_FINAL' ? 'FOCO: Mix de fechamento + aceleração de leads quentes' : ''}
${faseDoMes === 'MEIO_DO_MES' ? 'FOCO: Avaliar ritmo e intensificar ações nos gaps' : ''}
${faseDoMes === 'INICIO' ? 'FOCO: Construção de pipeline, prospecção ativa, volume de atividades' : ''}

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
  "positivos": ["insight específico 1", "insight específico 2"],
  "negativos": ["ponto de atenção 1 com contexto", "ponto 2"],
  "acoes48h": ["VERBO + NÚMERO + ALVO + CANAL específico"]
}

REGRAS RÍGIDAS:
- positivos: 2-3 insights com NÚMEROS e contexto de mercado, max 70 chars
- negativos: 2-3 pontos com IMPACTO no negócio, max 70 chars
- acoes48h: 2-4 ações ULTRA ESPECÍFICAS com número+canal, max 55 chars, verbos no INFINITIVO
- acoes48h DEVEM endereçar os KPIs com gap: ${gapLabels.join(', ') || 'manutenção'}
- Considere a FASE do mês: ${faseDoMes}`;

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
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      analysis = {
        positivos: ["Dados em análise"],
        negativos: ["Aguardando mais informações"],
        acoes48h: ["Verificar dados do mês"]
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