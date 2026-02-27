import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTicket, saveDecisions, approveTicket } from "../lib/supabase";
import ToolCard from "../components/ToolCard";
import { Loader2, AlertCircle, Save, CheckCircle2, ArrowUpDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "name", label: "Name A→Z" },
  { value: "id_asc", label: "ID ↑" },
  { value: "id_desc", label: "ID ↓" },
  { value: "grade", label: "Grade" },
  { value: "score_desc", label: "Score ↓" },
];

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [tools, setTools] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    getTicket(Number(id))
      .then((data) => {
        setTicket(data.ticket);
        setTools(data.tools);
        const d = {};
        data.tools.forEach((t) => {
          d[t.tool_raw_id] = t.decision || "inactive";
        });
        setDecisions(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const sorted = useMemo(() => {
    const arr = [...tools];
    switch (sortBy) {
      case "name": return arr.sort((a, b) => (a.tool_name || "").localeCompare(b.tool_name || ""));
      case "id_asc": return arr.sort((a, b) => a.tool_raw_id - b.tool_raw_id);
      case "id_desc": return arr.sort((a, b) => b.tool_raw_id - a.tool_raw_id);
      case "grade": {
        const order = { A: 0, B: 1, C: 2, D: 3 };
        return arr.sort((a, b) => (order[a.grade] ?? 9) - (order[b.grade] ?? 9));
      }
      case "score_desc": return arr.sort((a, b) => (b.average_score ?? 0) - (a.average_score ?? 0));
      default: return arr;
    }
  }, [tools, sortBy]);

  const toggleDecision = (toolId) => {
    setDecisions((prev) => ({
      ...prev,
      [toolId]: prev[toolId] === "active" ? "inactive" : "active",
    }));
  };

  const setAll = (value) => {
    const d = {};
    tools.forEach((t) => { d[t.tool_raw_id] = value; });
    setDecisions(d);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const arr = Object.entries(decisions).map(([tool_raw_id, decision]) => ({
        tool_raw_id: Number(tool_raw_id), decision,
      }));
      await saveDecisions(Number(id), arr);
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("Approve this ticket? 'Yes' tools will go live.")) return;
    setApproving(true);
    try {
      const arr = Object.entries(decisions).map(([tool_raw_id, decision]) => ({
        tool_raw_id: Number(tool_raw_id), decision,
      }));
      await approveTicket(Number(id), arr);
      navigate("/requests");
    } catch (e) {
      alert("Approve failed: " + e.message);
    } finally {
      setApproving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-cyan-400" size={24} /></div>;
  if (error) return <div className="flex items-center justify-center h-64 text-red-400 gap-2"><AlertCircle size={18} /> {error}</div>;
  if (!ticket) return <div className="text-gray-500 text-center py-16">Ticket not found</div>;

  const isPending = ticket.status === "pending";
  const yesCount = Object.values(decisions).filter((d) => d === "active").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">{ticket.name || `Ticket #${ticket.id}`}</h2>
          {ticket.name && <span className="text-xs text-gray-500">#{ticket.id}</span>}
          <p className="text-xs text-gray-500 mt-1">
            {ticket.tool_count} tools · Created {new Date(ticket.created_at).toLocaleDateString()}
            {ticket.approved_at && ` · Approved ${new Date(ticket.approved_at).toLocaleDateString()}`}
          </p>
        </div>
        {isPending && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{yesCount}/{tools.length} selected</span>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
            </button>
            <button onClick={handleApprove} disabled={approving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500 text-sm text-white hover:bg-cyan-400 transition-colors disabled:opacity-50">
              {approving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve
            </button>
          </div>
        )}
      </div>

      {isPending && (
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setAll("active")} className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">All Yes</button>
          <button onClick={() => setAll("inactive")} className="text-xs px-2.5 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">All No</button>
          <div className="ml-auto flex items-center gap-2">
            <ArrowUpDown size={14} className="text-gray-500" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-sm text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500/50">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((tool) => (
          <ToolCard
            key={tool.tool_raw_id}
            tool={tool}
            decision={decisions[tool.tool_raw_id] || "inactive"}
            onToggle={() => toggleDecision(tool.tool_raw_id)}
            locked={!isPending}
          />
        ))}
      </div>
    </div>
  );
}
