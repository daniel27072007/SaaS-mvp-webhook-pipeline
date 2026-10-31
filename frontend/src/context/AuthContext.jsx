import { createContext, useState, useEffect, useContext  } from "react";
import { jwtDecode } from "jwt-decode"
import api from '../services/api.js'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const token = localStorage.getItem('access-token')
        if(token){
            try {
                const decoded = jwtDecode(token)
                setUser({
                    id: decoded.userId,
                    subscription: decoded.userSubscription   
                })
            } catch (error) {
                localStorage.removeItem('access-token')
            }
        }
        setLoading(false)
    }, [])

    const login = (token) => {
        localStorage.setItem('access-token', token)
        const decoded = jwtDecode(token)
        setUser({
            id: decoded.userId,
            subscription: decoded.userSubscription
        })
    }

    const logout = (token) => {
        localStorage.removeItem('access-token')
        setUser(null)
    }

    const refreshUserSubscription = async () => {
        try {
            const response = await api.get('/api/users/profile')
            const updatedProfile = response.data
            setUser(prev => ({
                ...prev,
                subscription: updatedProfile.subscription
            }))
            return updatedProfile.subscription
        } catch (error) {
            console.error('Error when updating data of the session:', error)
        }
    }

    return(
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUserSubscription}}>
                {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)