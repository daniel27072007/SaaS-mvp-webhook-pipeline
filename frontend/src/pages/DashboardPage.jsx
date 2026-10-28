import { useState, useEffect } from 'react'
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from '../services/api.js';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function DashboardPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    //dashboard-summary part
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

    //analytics-reports part
    const [chartData, setChartData] = useState(null)
    const [loadingChartData, setChartDataLoading] = useState(false)
    const handleSimulateReport = async () => {
      setChartDataLoading(true)
      try {
        const response = await api.post('/api/features/analytics-reports', {
          filaName: 'corporate_revenue_q4.csv',
          fileSize: '2.8 MB'
        })
        setChartData(response.data.data)
      } catch (error) {
        console.error('RBAC Block or Server Error', error)
      } finally{
        setChartDataLoading(false)
      }
    }

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

        {/* Seção de Relatórios e Gráficos (RBAC / Recharts) */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-200">Analytics Report Pipeline</h3>
              <p className="text-xs text-slate-400">Process financial records and visualize trends.</p>
            </div>
            
            {/* Se o plano for 'none', desabilita o botão visualmente */}
            <button
              onClick={handleSimulateReport}
              disabled={loadingChartData || user?.subscription === 'none'}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 disabled:text-slate-500 font-bold text-xs rounded-xl transition cursor-pointer disabled:cursor-not-allowed"
            >
              {loadingChartData ? 'Processing...' : 'Simulate Report Upload'}
            </button>
          </div>

          {/* Controle Visual de Planos (RBAC Front-end) */}
          {user?.subscription === 'none' ? (
            <div className="bg-slate-900/60 border border-dashed border-slate-700 p-12 rounded-xl text-center space-y-3">
              <p className="text-sm text-slate-400">
                🔒 The Analytics Graph Suite is exclusive to Normal and Premium plans.
              </p>
              <p className="text-xs text-cyan-400 font-medium">
                Upgrade your subscription to unlock file pipelines and interactive data engines.
              </p>
            </div>
          ) : (
            <>
              {/* Se o usuário tiver acesso mas ainda não clicou no botão */}
              {!chartData && !loadingChartData && (
                <div className="border border-dashed border-slate-700 p-12 rounded-xl text-center text-sm text-slate-500">
                  Click the button above to simulate a pipeline file processing event.
                </div>
              )}

              {/* Gráfico do Recharts quando os dados chegam */}
              {chartData && (
                <div className="space-y-4">
                  <div className="text-xs bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 flex flex-wrap gap-4 text-slate-400">
                    <div>File: <span className="text-slate-300 font-mono">{chartData.meta.processedFile}</span></div>
                    <div>Size: <span className="text-slate-300 font-mono">{chartData.meta.size}</span></div>
                  </div>

                  <div className="w-full h-[300px] bg-slate-900/30 p-4 rounded-xl border border-slate-700/30">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.charts.lineChart.datasets[0].data.map((val, index) => ({
                        month: chartData.charts.lineChart.labels[index],
                        Sales: val,
                        Costs: chartData.charts.lineChart.datasets[1].data[index]
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }} />
                        <Legend />
                        <Line type="monotone" dataKey="Sales" stroke="#22d3ee" strokeWidth={2} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Costs" stroke="#f43f5e" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </main>
    </div>
  );
}