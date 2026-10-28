import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  // 1. Controlled states to capture input values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subscription: 'none', // Default plan option
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Track real-time typing events
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Handle local validation and printing for verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    // Initial validation safeguard
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required.');
      setLoading(false);
      return;
    }

    try{
        const response = await api.post('/api/auth/register', formData)
        const token = response.data?.['access-token']
        if(token){
            login(token)
            setSuccessMessage('Account created successfully. Redirecting...')
            setError('')
            setTimeout(() => {
                navigate('/dashboard')
            }, 1500)
        }
        else{
            setError('Server responded successfully, but authentication token was missing.');
        }
    } catch (error) {
      const backendMessage = error.response?.data?.message || 'Something went wrong when registering.';
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
        <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Create Your Account
        </h2>

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
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-100 text-sm transition"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-100 text-sm transition"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-100 text-sm transition"
            />
          </div>

          {/* Subscription Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Select Subscription Plan</label>
            <select
              name="subscription"
              value={formData.subscription}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-100 text-sm transition"
            >
              <option value="none">None (Free Access)</option>
              <option value="normal">Normal Plan</option>
              <option value="premium">Premium Plan</option>
            </select>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
// will comeback later for implamenting checkout in plan selection