import { Link } from 'react-router-dom';

export default function AuthHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-50">
      {/* Brand logo targeting back to the primary Landing Page / root */}
      <Link to="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent hover:opacity-90 transition">
        SaaS MVP
      </Link>
      
      <div className="space-x-4">
        <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-cyan-400 transition">
          Sign In
        </Link>
        <Link to="/register" className="px-4 py-2 text-sm font-medium bg-cyan-600 hover:bg-cyan-500 rounded-md transition text-slate-950 font-semibold">
          Get Started
        </Link>
      </div>
    </header>
  );
}