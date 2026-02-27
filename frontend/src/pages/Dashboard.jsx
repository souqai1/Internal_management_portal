import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listTickets } from "../lib/supabase";
import { ClipboardList, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listTickets()
      .then(setTickets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-cyan-400" size={24} />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-400 gap-2">
      <AlertCircle size={18} /> {error}
    </div>
  );

  const pending = tickets.filter((t) => t.status === "pending");
  const approved = tickets.filter((t) => t.status === "approved");

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <ClipboardList size={20} className="text-cyan-400" /> Requests
      </h2>

      {pending.length === 0 && approved.length === 0 && (
        <div className="text-center text-gray-500 py-16">No tickets yet. They will appear here when Make.com sends tool batches.</div>
      )}

      {pending.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Pending Review</h3>
          <div className="space-y-2">
            {pending.map((t) => <TicketRow key={t.id} ticket={t} />)}
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Approved</h3>
          <div className="space-y-2">
            {approved.map((t) => <TicketRow key={t.id} ticket={t} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function TicketRow({ ticket }) {
  const isPending = ticket.status === "pending";
  const displayName = ticket.name || `Ticket #${ticket.id}`;

  return (
    <Link
      to={`/requests/${ticket.id}`}
      className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-800 bg-gray-900 hover:bg-gray-800/70 transition-colors group"
    >
      <div className="flex items-center gap-3">
        {isPending ? (
          <Clock size={16} className="text-amber-400" />
        ) : (
          <CheckCircle2 size={16} className="text-emerald-400" />
        )}
        <span className="text-sm text-white font-medium">{displayName}</span>
        {ticket.name && <span className="text-[10px] text-gray-600">#{ticket.id}</span>}
        <span className="text-xs text-gray-500">{ticket.tool_count} tools</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${isPending ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
          {ticket.status}
        </span>
        <span className="text-xs text-gray-600">{new Date(ticket.created_at).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
