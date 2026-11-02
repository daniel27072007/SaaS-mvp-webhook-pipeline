import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthHeader() {
  const { user } = useAuth()
  return (
    <header className="absolute top-0 left-0 right-0 max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-50">
      {/* Brand logo targeting back to the primary Landing Page / root */}
      <Link to="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent hover:opacity-90 transition">
        SaaS MVP
      </Link>
      
      <div className="space-x-4">
        {/* Show a diferents buttons if the user is loged */}
        {user ? (
          // Se o usuário estiver logado, exibe apenas o link direto ao painel logado
          <Link to="/dashboard" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-md transition text-slate-950 font-bold shadow-md shadow-cyan-500/10">
            Go to Dashboard
          </Link>
        ) : (
          // Se não houver token/usuário, mantém as ações públicas de autenticação
          <>
            <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-cyan-400 transition">
              Sign In
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium bg-cyan-600 hover:bg-cyan-500 rounded-md transition text-slate-950 font-semibold">
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}