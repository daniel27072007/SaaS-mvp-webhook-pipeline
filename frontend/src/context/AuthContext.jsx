import { createContext, useState, useEffect, useContext  } from "react";
import { jwtDecode } from "jwt-decode"

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

    return(
        <AuthContext.Provider value={{ user, loading, login, logout}}>
                {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)