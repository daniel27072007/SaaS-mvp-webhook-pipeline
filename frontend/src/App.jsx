import { BrowserRouter, Routes, Route} from 'react-router-dom'
import LandingPage from './pages/landingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/register' element={<RegisterPage/>}/>
        {/* Private Routes */}
        <Route element={<PrivateRoute/>}>
          <Route path='/dashboard' element={<DashboardPage/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App