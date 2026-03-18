import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json() as { token: string };

    if (!token || typeof token !== "string" || token.length < 4) {
      return new Response(JSON.stringify({ valid: false, error: "Invalid token format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to bypass RLS — token table is not readable by public
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabase
      .from("assessor_tokens")
      .select("id, assessor_name, is_active, allowed_screens, role, last_production_update_at")
      .eq("token", token)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("DB error validating token:", error);
      return new Response(JSON.stringify({ valid: false, error: "Validation error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!data) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        valid: true,
        id: data.id,
        assessor_name: data.assessor_name,
        is_active: data.is_active,
        allowed_screens: data.allowed_screens,
        role: data.role,
        last_production_update_at: data.last_production_update_at,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error in validate-token:", err);
    return new Response(JSON.stringify({ valid: false, error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
