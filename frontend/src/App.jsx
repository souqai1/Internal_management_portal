import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TicketDetail from "./pages/TicketDetail";
import {
  Boxes,
  LayoutGrid,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();
  const isRequests =
    location.pathname === "/requests" ||
    location.pathname.startsWith("/requests/");

  const navItems = [
    { label: "Overview", icon: LayoutGrid, path: "/overview", soon: true },
    { label: "Requests", icon: ClipboardList, path: "/requests" },
    { label: "Settings", icon: Settings, path: "/settings", soon: true },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-gray-900 border-r border-gray-800 flex flex-col z-30">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Boxes size={24} className="text-cyan-400" />
        <div>
          <h1 className="text-base font-bold text-white leading-none">SouqAI</h1>
          <span className="text-[10px] text-gray-500">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-2 space-y-1">
        {navItems.map((item) => {
          const active =
            item.path === "/requests" ? isRequests : location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.soon ? "#" : item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-cyan-500/10 text-cyan-400 font-medium"
                  : item.soon
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
              onClick={(e) => item.soon && e.preventDefault()}
            >
              <item.icon size={18} />
              {item.label}
              {item.soon && (
                <span className="ml-auto text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const crumbs = [{ label: "Admin", path: "/" }];
  if (segments[0] === "requests") {
    crumbs.push({ label: "Requests", path: "/requests" });
    if (segments[1]) {
      crumbs.push({ label: `Ticket #${segments[1]}`, path: location.pathname });
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      {crumbs.map((c, i) => (
        <span key={c.path} className="flex items-center gap-2">
          {i > 0 && <span>›</span>}
          {i === crumbs.length - 1 ? (
            <span className="text-gray-300">{c.label}</span>
          ) : (
            <Link to={c.path} className="hover:text-gray-300 transition-colors">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar />
      <main className="ml-56 p-8">
        <Breadcrumbs />
        <Routes>
          <Route path="/requests" element={<Dashboard />} />
          <Route path="/requests/:id" element={<TicketDetail />} />
          <Route path="*" element={<Navigate to="/requests" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { authenticated, loading } = useAuth();

  if (loading) return null;
  if (!authenticated) return <Login />;
  return <AuthenticatedLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
