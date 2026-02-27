import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Call a Supabase Edge Function.
 */
async function callFn(name, body = {}, method = "POST") {
  const { data, error } = await supabase.functions.invoke(name, {
    body,
    method,
  });
  if (error) throw error;
  return data;
}

export function listTickets() {
  return callFn("list-tickets", {});
}

export function getTicket(id) {
  return callFn("get-ticket", { ticket_id: id });
}

export function saveDecisions(ticketId, decisions) {
  return callFn("save-decisions", { ticket_id: ticketId, decisions });
}

export function approveTicket(ticketId, decisions) {
  return callFn("approve-ticket", { ticket_id: ticketId, decisions });
}
