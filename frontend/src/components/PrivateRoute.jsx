import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
    const { user, loading } = useAuth()
    if(loading){
        return <div className="min-h-screen bg-slate-900 text-cyan-400 flex items-center justify-center">Loading...</div>;
    }
    return user ? <Outlet/> : <Navigate to="/login"/>
}