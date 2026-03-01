import { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user,        setUser]        = useState(null);
    const [loading,     setLoading]     = useState(true);
    const [accesToken,  setAccessToken] = useState(null);
    const isRefreshing  = useRef(false);

    useEffect(() => {
        const checkSession = async () => {
            if (isRefreshing.current) return;
            isRefreshing.current = true;
            try {
                await refreshAccessToken();
            } catch {
                // Pas de session active — c'est normal (visiteur non connecté)
                setUser(null);
                setAccessToken(null);
            } finally {
                setLoading(false);
                isRefreshing.current = false;
            }
        };
        checkSession();
    }, []);

    const refreshAccessToken = async () => {
        const response = await fetch('/api/refresh', {
            method:      'GET',
            credentials: 'include',         // envoie le cookie refresh_token
            headers:     { Accept: 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Session expirée');
        }

        const data = await response.json();

        // L'API renvoie { accesToken, user, ... }
        if (!data.accesToken || !data.user) {
            throw new Error('Réponse API invalide');
        }

        setUser(data.user);
        setAccessToken(data.accesToken);
    };

    /** Appelé après login ou register */
    const login = (userData, token) => {
        setUser(userData);
        setAccessToken(token);
    };

    /** Appelé au logout */
    const logout = async () => {
        try {
            await fetch('/api/logout', {
                method:      'POST',
                credentials: 'include',
                headers: {
                    Accept:          'application/json',
                    Authorization:   accesToken ? `Bearer ${accesToken}` : '',
                },
            });
        } catch {
            // On déconnecte côté client même si l'API échoue
        } finally {
            setUser(null);
            setAccessToken(null);
        }
    };

    const value = {
        user,
        login,
        logout,
        refreshAccessToken,
        isAuthenticated: !!user,
        loading,
        accesToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}