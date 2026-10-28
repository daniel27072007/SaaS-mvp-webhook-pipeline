import { useState, useEffect } from 'react'
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from '../services/api.js';
import { use } from 'react';

export default function DashboardPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const [summary, setSummary] = useState(null)
    const [summaryLoading, setSummaryLoading] = useState(true)

    useEffect(() => {
        const fecthSummary = async () => {
            try {
                const response = await api.get('/api/features/dashboard-summary')
                setSummary(response.data.data)
            } catch (error) {
                console.error('Failed to load dashboard statistics:', error)
            } finally {
                setSummaryLoading(false)
            }
        }
        fecthSummary()
    }, [])

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

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Estado de Carregamento Local */}
        {summaryLoading ? (
          <div className="text-center py-12 text-cyan-400 animate-pulse font-medium">
            Fetching server analytics...
          </div>
        ) : (
          <>
            {/* Grid de Cards Estatísticos (Dados vindos do Backend) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
                <p className="text-sm text-slate-400 font-medium">Total Users</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{summary?.overview?.totalUsers}</p>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
                <p className="text-sm text-slate-400 font-medium">Active Subscriptions</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">{summary?.overview?.activeSubscriptions}</p>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
                <p className="text-sm text-slate-400 font-medium">Monthly Revenue</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  ${summary?.overview?.monthlyRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
                <p className="text-sm text-slate-400 font-medium">Growth Revenue</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">+{summary?.overview?.growthPercentage}%</p>
              </div>

            </div>

            {/* Layout de duas colunas para Atividades e Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Painel de Atividades Recentes */}
              <div className="lg:col-span-2 bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg space-y-4">
                <h3 className="text-lg font-bold text-slate-200">Recent Webhook & System Activities</h3>
                <div className="divide-y divide-slate-700">
                  {summary?.recentActivity?.map((activity) => (
                    <div key={activity.id} className="py-3 flex justify-between items-center text-sm">
                      <span className="text-slate-300 font-medium">{activity.action}</span>
                      <span className="text-slate-500 text-xs">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status do Sistema Corporativo */}
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-200">System Gateway</h3>
                  <p className="text-xs text-slate-400">Real-time status connectivity map.</p>
                </div>
                
                <div className="mt-4 p-4 bg-slate-900/60 rounded-lg border border-slate-700/50 flex items-center justify-between">
                  <span className="text-sm text-slate-300 font-medium">API Core Pipeline</span>
                  <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {summary?.systemStatus?.apiStatus}
                  </span>
                </div>
              </div>

            </div>
          </>
        )}

      </main>
    </div>
  );
}