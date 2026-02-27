import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseClient, corsHeaders, jsonResponse, errorResponse } from "../_shared/db.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    const { ticket_id } = await req.json();
    if (!ticket_id) return errorResponse("ticket_id required");

    const supabase = getSupabaseClient(req);

    // Get ticket
    const { data: ticket, error: tErr } = await supabase
      .from("review_tickets")
      .select("id, name, status, tool_count, created_at, approved_at")
      .eq("id", ticket_id)
      .single();

    if (tErr || !ticket) return errorResponse("Ticket not found", 404);

    // Get ticket items with joined tool data
    const { data: items, error: iErr } = await supabase
      .from("review_ticket_items")
      .select("tool_raw_id, decision")
      .eq("ticket_id", ticket_id);

    if (iErr) return errorResponse(iErr.message, 500);

    // Get full tool details for each item
    const toolIds = items.map((i: any) => i.tool_raw_id);

    const { data: rawTools } = await supabase
      .from("tools_raw")
      .select("id, tool_name, domain, platform_link, category, raw_info")
      .in("id", toolIds);

    const { data: validations } = await supabase
      .from("tools_validation")
      .select("tool_id, classification, domain_tags, reason, status")
      .in("tool_id", toolIds);

    const { data: criteria } = await supabase
      .from("tools_criteria")
      .select("tool_id, grade, average_score, info")
      .in("tool_id", toolIds);

    // Build lookup maps
    const rawMap = new Map((rawTools || []).map((t: any) => [t.id, t]));
    const valMap = new Map((validations || []).map((v: any) => [v.tool_id, v]));
    const criMap = new Map((criteria || []).map((c: any) => [c.tool_id, c]));

    const tools = items.map((item: any) => {
      const raw = rawMap.get(item.tool_raw_id) || {};
      const val = valMap.get(item.tool_raw_id) || {};
      const cri = criMap.get(item.tool_raw_id) || {};
      return {
        tool_raw_id: item.tool_raw_id,
        tool_name: raw.tool_name,
        domain: raw.domain,
        platform_link: raw.platform_link,
        category: raw.category,
        raw_info: raw.raw_info,
        classification: val.classification,
        domain_tags: val.domain_tags || [],
        reason: val.reason,
        current_status: val.status || "inactive",
        grade: cri.grade,
        average_score: cri.average_score,
        info: cri.info,
        decision: item.decision,
      };
    });

    return jsonResponse({ ticket, tools });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
});
