import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseClient, corsHeaders, jsonResponse, errorResponse } from "../_shared/db.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    const supabase = getSupabaseClient(req);

    const { data, error } = await supabase
      .from("review_tickets")
      .select("id, name, status, tool_count, created_at, approved_at")
      .order("status", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) return errorResponse(error.message, 500);

    return jsonResponse(data);
  } catch (e) {
    return errorResponse(e.message, 500);
  }
});
