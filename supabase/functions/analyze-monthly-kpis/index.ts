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

    // Use ritmoIdeal (percentage of elapsed days) for temporal context - NOT fixed day thresholds
    const percentualMes = monthlyData.ritmoIdeal;
    const urgencyContext = percentualMes >= 90
      ? `URGÊNCIA MÁXIMA: ${monthlyData.diasUteisRestantes} dias úteis restantes de ${monthlyData.totalDiasUteis}. Fechamento iminente do mês!`
      : percentualMes >= 70
        ? `TERÇO FINAL DO MÊS: ${monthlyData.diasUteisDecorridos} de ${monthlyData.totalDiasUteis} dias úteis já passaram (${percentualMes}%). Restam ${monthlyData.diasUteisRestantes} dias para fechar.`
        : percentualMes >= 40
          ? `METADE DO MÊS: ${monthlyData.diasUteisDecorridos} de ${monthlyData.totalDiasUteis} dias úteis decorridos (${percentualMes}%). Momento de avaliar ritmo.`
          : `INÍCIO DO MÊS: ${monthlyData.diasUteisDecorridos} de ${monthlyData.totalDiasUteis} dias úteis decorridos (${percentualMes}%). Bom momento para ajustar estratégias.`;

    // Identify top gaps for actionable insights
    const kpiGaps = monthlyData.gaugeKPIs
      .map(kpi => ({ label: kpi.label, gap: kpi.target - kpi.value, percentage: kpi.percentage }))
      .filter(k => k.gap > 0)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3);
    
    const gapContext = kpiGaps.length > 0 
      ? `KPIs com maior gap: ${kpiGaps.map(k => `${k.label} (${k.percentage}%)`).join(', ')}`
      : 'Todos os KPIs acima da meta';

    const systemPrompt = `Você é um analista financeiro especializado em assessorias de investimento e mercado financeiro brasileiro. 
Analise os dados de KPIs mensais fornecidos e identifique pontos positivos, pontos de atenção, e AÇÕES PRÁTICAS para as próximas 48 horas.

Contexto da empresa:
- Empresa de assessoria de investimentos
- Métricas principais: Receita, NNM (Net New Money), Captação, Reuniões, COE, Previdência, Câmbio, Seguros
- O ICM (Índice de Conquista de Metas) mede o percentual de atingimento das metas
- Ritmo Ideal indica o percentual esperado considerando os dias úteis decorridos no mês (ex: se passou 80% do mês, o ritmo ideal é 80%)
- Meta semanal é o objetivo acumulado da semana atual

CONTEXTO TEMPORAL CRÍTICO:
${urgencyContext}

IMPORTANTE: O ritmo ideal de ${monthlyData.ritmoIdeal}% significa que já passaram ${monthlyData.ritmoIdeal}% dos dias úteis do mês.
- Se ICM Geral > Ritmo Ideal: equipe está ACIMA do esperado para este ponto do mês
- Se ICM Geral < Ritmo Ideal: equipe está ABAIXO do esperado e precisa acelerar

${gapContext}

REGRAS PARA AÇÕES 48H:
- Devem ser ESPECÍFICAS e MENSURÁVEIS (ex: "Ligar para 5 clientes PJ", não "Fazer mais ligações")
- Incluir NÚMEROS quando possível (quantidade de ligações, reuniões, propostas)
- Focar nos KPIs com maior gap vs meta
- Priorizar ações de ALTO IMPACTO e rápida execução
${percentualMes >= 90 ? '- URGENTE: Foco em FECHAMENTO de negócios em andamento' : ''}
${percentualMes >= 70 && percentualMes < 90 ? '- Mix de prospecção rápida + fechamento de pipeline' : ''}
${percentualMes < 70 ? '- Estratégias de volume e construção de pipeline' : ''}

Seja direto, objetivo e use linguagem profissional do mercado financeiro.
Responda APENAS em JSON válido no formato especificado.`;

    const userPrompt = `Analise os dados do mês ${monthlyData.selectedMonth} para ${assessorContext}:

SITUAÇÃO TEMPORAL:
- Dias úteis decorridos: ${monthlyData.diasUteisDecorridos} de ${monthlyData.totalDiasUteis} (${monthlyData.ritmoIdeal}% do mês)
- Dias úteis restantes: ${monthlyData.diasUteisRestantes}

DESEMPENHO:
- ICM Geral: ${monthlyData.icmGeral}%
- Ritmo Ideal: ${monthlyData.ritmoIdeal}%
- Diferença: ${monthlyData.icmGeral >= monthlyData.ritmoIdeal ? `ACIMA do ritmo em ${monthlyData.icmGeral - monthlyData.ritmoIdeal}pp` : `ABAIXO do ritmo em ${monthlyData.ritmoIdeal - monthlyData.icmGeral}pp`}

KPIs do mês:
${kpiSummary}

Meta semanal acumulada:
${metaSemanalSummary}

Top performers: ${topPerformers}

Retorne um JSON com exatamente este formato:
{
  "positivos": ["ponto positivo 1", "ponto positivo 2", "ponto positivo 3"],
  "negativos": ["ponto de atenção 1", "ponto de atenção 2", "ponto de atenção 3"],
  "acoes48h": ["ação específica 1", "ação específica 2", "ação específica 3"]
}

Regras:
- positivos/negativos: 2-4 pontos, máximo 60 caracteres cada
- acoes48h: 2-4 ações ESPECÍFICAS, máximo 50 caracteres cada, verbos no infinitivo
- acoes48h devem ter NÚMEROS (ex: "Ligar para 5 clientes PJ top")
- Foque nas métricas com maior gap: ${gapContext}
- Considere que estamos no ${percentualMes >= 90 ? 'FECHAMENTO' : percentualMes >= 70 ? 'TERÇO FINAL' : percentualMes >= 40 ? 'MEIO' : 'INÍCIO'} do mês.`;

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
