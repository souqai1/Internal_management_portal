import { useState } from "react";
import { ExternalLink, ChevronDown, X } from "lucide-react";

const GRADE_COLORS = {
  A: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  B: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  C: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  D: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function ToolCard({ tool, decision, onToggle, locked }) {
  const [showDetail, setShowDetail] = useState(false);
  const isYes = decision === "active";
  const gradeClass = GRADE_COLORS[tool.grade] || "bg-gray-800 text-gray-400 border-gray-700";
  const tags = Array.isArray(tool.domain_tags) ? tool.domain_tags : [];

  return (
    <>
      <div className="flex items-start gap-4 px-4 py-3 rounded-lg border border-gray-800 bg-gray-900">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white truncate">{tool.tool_name}</span>
            <span className="text-[10px] text-gray-600">#{tool.tool_raw_id}</span>
            {tool.grade && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${gradeClass}`}>
                {tool.grade}
              </span>
            )}
            {tool.category && (
              <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                {tool.category}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {tool.raw_info || tool.classification || "No description"}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {tool.domain && (
              <a href={tool.domain.startsWith("http") ? tool.domain : `https://${tool.domain}`} target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <ExternalLink size={10} /> {tool.domain}
              </a>
            )}
            {tags.slice(0, 5).map((tag, i) => (
              <span key={i} className="text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">{tag}</span>
            ))}
            {tags.length > 5 && <span className="text-[10px] text-gray-600">+{tags.length - 5}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setShowDetail(true)}
            className="text-[10px] text-gray-500 hover:text-gray-300 flex items-center gap-0.5 transition-colors">
            More <ChevronDown size={10} />
          </button>

          {locked ? (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isYes ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-800 text-gray-500"}`}>
              {isYes ? "Yes" : "No"}
            </span>
          ) : (
            <button onClick={onToggle}
              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${isYes ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" : "bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-gray-300"}`}>
              {isYes ? "Yes" : "No"}
            </button>
          )}
        </div>
      </div>

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDetail(false)}>
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">{tool.tool_name}</h3>
                <span className="text-xs text-gray-500">#{tool.tool_raw_id}</span>
              </div>
              <button onClick={() => setShowDetail(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-sm">
              {tool.raw_info && <Field label="Description" value={tool.raw_info} />}
              {tool.classification && <Field label="Classification" value={tool.classification} />}
              {tool.reason && <Field label="Reason" value={tool.reason} />}
              {tool.grade && <Field label="Grade" value={tool.grade} />}
              {tool.average_score != null && <Field label="Score" value={String(tool.average_score)} />}
              {tool.current_status && <Field label="Current Status" value={tool.current_status} />}
              {tags.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Domain Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              {tool.domain && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Link</span>
                  <a href={tool.domain.startsWith("http") ? tool.domain : `https://${tool.domain}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                    <ExternalLink size={12} /> {tool.domain}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <span className="text-xs text-gray-500 block mb-0.5">{label}</span>
      <p className="text-gray-300">{value}</p>
    </div>
  );
}
