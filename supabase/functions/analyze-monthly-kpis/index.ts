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

    const urgencyContext = monthlyData.diasUteisRestantes <= 5 
      ? "URGÊNCIA: Restam poucos dias úteis para fechar o mês!" 
      : monthlyData.diasUteisRestantes <= 10 
        ? "Atenção: Segunda metade do mês, hora de acelerar." 
        : "Início do mês, bom momento para ajustar estratégias.";

    const systemPrompt = `Você é um analista financeiro especializado em assessorias de investimento e mercado financeiro brasileiro. 
Analise os dados de KPIs mensais fornecidos e identifique pontos positivos e pontos de atenção.

Contexto da empresa:
- Empresa de assessoria de investimentos
- Métricas principais: Receita, NNM (Net New Money), Captação, Reuniões, COE, Previdência, Câmbio, Seguros
- O ICM (Índice de Conquista de Metas) mede o percentual de atingimento das metas
- Ritmo Ideal indica o percentual esperado considerando os dias úteis decorridos no mês
- Meta semanal é o objetivo acumulado da semana atual

${urgencyContext}

Seja direto, objetivo e use linguagem profissional do mercado financeiro.
Responda APENAS em JSON válido no formato especificado.`;

    const userPrompt = `Analise os dados do mês ${monthlyData.selectedMonth} para ${assessorContext}:

ICM Geral: ${monthlyData.icmGeral}%
Ritmo Ideal: ${monthlyData.ritmoIdeal}%
Dias úteis restantes: ${monthlyData.diasUteisRestantes}

KPIs do mês:
${kpiSummary}

Meta semanal acumulada:
${metaSemanalSummary}

Top performers: ${topPerformers}

Retorne um JSON com exatamente este formato:
{
  "positivos": ["ponto positivo 1", "ponto positivo 2", "ponto positivo 3"],
  "negativos": ["ponto de atenção 1", "ponto de atenção 2", "ponto de atenção 3"]
}

Cada ponto deve ter no máximo 60 caracteres. Identifique 2-4 pontos em cada categoria baseado nos dados.
Foque em insights acionáveis para o fechamento do mês.`;

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
