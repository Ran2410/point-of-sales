import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem("user") || "null"); }
        catch { return null; }
    });

    const login = useCallback((token, userData, refreshToken = null) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        try { await api.post("/auth/logout"); } catch { /* ignore */ }
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    }, [navigate]);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
