import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ProfilePage() { 
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    //getting profile data from api
    const [profileData, setProfileData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchProfileData = async () => {
            try{
                setLoading(true)
                const response = await api.get('/api/users/profile')
                setProfileData(response.data)
            } catch (error) {
                console.error('failed to seach profile info', error)
                setError('Was not able to load profile info.');
            } finally {
                setLoading(false)
            }
        }
        fetchProfileData()
    }, [])

    //part that makes frontend send the correct info to api so can change the password
    const [passwordForm, setPasswordForm] = useState({
        password: '',
        newPassword: '',
    })
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setFormError('')
        setFormSuccess('')
        if(!passwordForm.password || !passwordForm.newPassword){
            setFormError('Both current and new password fields are required.');
            return
        }
        try {
            setFormLoading(true)
            const response = await api.put('/api/users/profile', passwordForm)
            setFormSuccess(response.data?.message || 'Password updated with success.')
            setPasswordForm({ password: '', newPassword: '' })
        } catch (error) {
            console.error('Error when updating the password:', error);
            const backendMessage = error.response?.data?.message || error.response?.data?.erroror || 'Failed to update password.';
            setFormError(backendMessage);
        } finally {
            setFormLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setPasswordForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-cyan-400 flex items-center justify-center font-medium animate-pulse">
        Fetching profile data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Cabeçalho Superior Simples */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-md">
        <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                User Profile Settings
            </h1>
            <p className="text-xs text-slate-400">
                User ID: <span className="text-slate-300 font-mono">{user?.id}</span>
            </p>
        </div>
        <div className="flex items-center gap-4">
            <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs font-medium transition cursor-pointer"
            >
                Back to Dashboard
            </button>
            <button
            onClick={handleLogout}
            className="px-4 py-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white rounded-lg text-xs font-medium transition cursor-pointer"
            >
                Sign Out
            </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 max-w-4xl w-full mx-auto space-y-6">
        
        {/* Alerta de Erro se houver falha na API */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Seção 1: Informações do Perfil de forma Dinâmica */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-slate-200 border-b border-slate-700 pb-2">Account Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 font-medium">Full Name</p>
              <p className="text-base text-slate-100 font-semibold mt-0.5">{profileData?.name}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Email Address</p>
              <p className="text-base text-slate-100 font-semibold mt-0.5">{profileData?.email}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Current Plan</p>
              <span className="inline-block px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold rounded-full uppercase tracking-wider mt-1">
                Plan: {profileData?.subscription}
              </span>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Subscription Status</p>
              <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider mt-1">
                Status: {profileData?.subscriptionStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Formulário de Segurança (Alteração de Senha) */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-slate-200 border-b border-slate-700 pb-2">Security Settings</h3>
          
          {/* Feedback de Erro do Formulário */}
          {formError && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm max-w-md">
              {formError}
            </div>
          )}

          {/* Feedback de Sucesso do Formulário */}
          {formSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-3 rounded-lg text-sm max-w-md">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                name="password"
                value={passwordForm.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-100 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-100 text-sm transition"
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 disabled:text-slate-500 font-bold text-xs rounded-xl transition cursor-pointer disabled:cursor-not-allowed"
            >
              {formLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}