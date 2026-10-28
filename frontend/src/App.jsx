import { BrowserRouter, Routes, Route} from 'react-router-dom'
import LandingPage from './pages/landingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext'

function App() {
  function TempDashboard() {
    const {logout} = useAuth()
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Dashboard (Under Construction)</h1>
        <p className="text-slate-400">If you can see this, your JWT authentication and flow work perfectly!</p>
        <button 
          onClick={() => {
            logout()
            window.location.href = '/'
          }} 
          className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm transition font-medium cursor-pointer"
        >
          Clear Token & Logout
        </button>
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/register' element={<RegisterPage/>}/>
        {/* Private Routes */}
        <Route element={<PrivateRoute/>}>
          <Route path='/dashboard' element={<TempDashboard/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
