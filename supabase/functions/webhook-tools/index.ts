import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseClient, corsHeaders, jsonResponse, errorResponse } from "../_shared/db.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    // Verify API key from Make.com
    const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    const expectedKey = Deno.env.get("WEBHOOK_API_KEY");
    if (!apiKey || apiKey !== expectedKey) {
      return errorResponse("Unauthorized", 401);
    }

    const { tool_ids, name } = await req.json();
    if (!tool_ids || typeof tool_ids !== "string") {
      return errorResponse("tool_ids must be a comma-separated string");
    }

    const rawIds = tool_ids.split(",").map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
    if (rawIds.length === 0) return errorResponse("No valid tool IDs provided");

    const supabase = getSupabaseClient(req);

    // Verify IDs exist in tools_raw
    const { data: existing } = await supabase
      .from("tools_raw")
      .select("id")
      .in("id", rawIds);

    const existingIds = new Set((existing || []).map((r: any) => r.id));
    const missing = rawIds.filter((id: number) => !existingIds.has(id));
    if (missing.length > 0) {
      return errorResponse(`tools_raw IDs not found: ${missing.join(", ")}`);
    }

    // Create ticket with optional name
    const ticketData: any = { tool_count: rawIds.length };
    if (name && typeof name === "string") ticketData.name = name.trim();

    const { data: ticket, error: tErr } = await supabase
      .from("review_tickets")
      .insert(ticketData)
      .select("id")
      .single();

    if (tErr) return errorResponse(tErr.message, 500);

    // Insert ticket items
    const items = rawIds.map((id: number) => ({
      ticket_id: ticket.id,
      tool_raw_id: id,
    }));

    const { error: iErr } = await supabase
      .from("review_ticket_items")
      .insert(items);

    if (iErr) return errorResponse(iErr.message, 500);

    return jsonResponse({
      ok: true,
      ticket_id: ticket.id,
      tool_count: rawIds.length,
      message: `Review ticket #${ticket.id} created with ${rawIds.length} tools`,
    });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
});
