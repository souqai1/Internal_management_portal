import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseClient, corsHeaders, jsonResponse, errorResponse } from "../_shared/db.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    const { ticket_id, decisions } = await req.json();
    if (!ticket_id || !decisions) return errorResponse("ticket_id and decisions required");

    const supabase = getSupabaseClient(req);

    // Verify ticket is pending
    const { data: ticket } = await supabase
      .from("review_tickets")
      .select("id, status")
      .eq("id", ticket_id)
      .single();

    if (!ticket) return errorResponse("Ticket not found", 404);
    if (ticket.status !== "pending") return errorResponse("Ticket already approved");

    // Save final decisions
    for (const d of decisions) {
      if (!["active", "inactive"].includes(d.decision)) {
        return errorResponse(`Invalid decision '${d.decision}' for tool ${d.tool_raw_id}`);
      }
      await supabase
        .from("review_ticket_items")
        .update({ decision: d.decision, updated_at: new Date().toISOString() })
        .eq("ticket_id", ticket_id)
        .eq("tool_raw_id", d.tool_raw_id);
    }

    // Set active tools live in tools_validation
    const activeIds = decisions
      .filter((d: any) => d.decision === "active")
      .map((d: any) => d.tool_raw_id);

    if (activeIds.length > 0) {
      await supabase
        .from("tools_validation")
        .update({ status: "active", updated_at: new Date().toISOString() })
        .in("tool_id", activeIds);
    }

    // Mark ticket approved
    await supabase
      .from("review_tickets")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", ticket_id);

    return jsonResponse({
      ok: true,
      message: `Ticket #${ticket_id} approved. ${activeIds.length} tools set to active.`,
    });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
});
