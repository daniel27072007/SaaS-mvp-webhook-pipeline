import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // 1. Setup local state for handling credential fields
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Capture and handle typing values dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Process form authentication action locally for now
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    // Initial validation safeguard check
    if (!credentials.email || !credentials.password) {
      setError('Both email and password are required fields.');
      setLoading(false);
      return;
    }

    try {
        const response = await api.post('/api/auth/login', credentials)
        const token = response.data?.['access-token']
        if(token){
            login(token)
            setSuccessMessage('Authentication successful! Redirecting...');
            setError('');
            setTimeout(() => {
                navigate('/dashboard')
            },1500)
        }
        else{
            setError('Server responded successfully, but token was missing.');
        }
    } catch (error) {
        const backendMessage = error.response?.data?.error || 'Invalid credentials or server offline.';
        setError(backendMessage);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
      {/* Reusable Header */}
      <AuthHeader />
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          Sign in to manage your system settings and reports
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-3 rounded-lg text-sm mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-100 text-sm transition"
            />
          </div>

          {/* Password Input Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-100 text-sm transition"
            />
          </div>

          {/* Login Submit Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an operational account?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
//if client get to login by clicking at normal or premium in '/' after login send with to dashboard?