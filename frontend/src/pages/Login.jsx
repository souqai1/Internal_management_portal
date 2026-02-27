import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Boxes, Lock, Loader2, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setTimeout(() => {
      const ok = login(password);
      if (!ok) { setError(true); setPassword(""); }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Boxes size={28} className="text-cyan-400" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">SouqAI</h1>
            <span className="text-xs text-gray-500">Admin Panel</span>
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-300">Sign in to continue</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  placeholder="Enter admin password"
                  autoFocus
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-lg bg-gray-800 border text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors ${error ? "border-red-500/50 focus:ring-red-500/50" : "border-gray-700"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="mt-1.5 text-xs text-red-400">Incorrect password. Try again.</p>}
            </div>
            <button type="submit" disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-[11px] text-gray-600 mt-4">Phase 1 · Internal Use Only</p>
      </div>
    </div>
  );
}
