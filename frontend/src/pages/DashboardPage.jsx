import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Barra Superior (Navbar do Painel) */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            SaaS Corporate Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Welcome back! User ID: <span className="text-slate-300 font-mono">{user?.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Badge mostrando o plano atual do usuário dinamicamente */}
          <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold rounded-full uppercase tracking-wider">
            Plan: {user?.subscription}
          </span>
          
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white rounded-lg text-xs font-medium transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Conteúdo Principal (Onde os cards e relatórios vão entrar depois) */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <div className="bg-slate-800/40 border border-slate-800 p-8 rounded-2xl text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">Workspace Overview</h2>
          <p className="text-slate-400 text-sm">
            This workspace adapts based on your active subscription status.
          </p>
        </div>
      </main>
    </div>
  );
}