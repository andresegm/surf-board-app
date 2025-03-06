import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: { id: number; name: string; email: string; role: string } | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthContextType["user"]>(null);

    // Check if user is logged in (backend handles authentication via cookies)
    useEffect(() => {
        fetch("http://localhost:5050/auth/me", { credentials: "include" }) // Check user session
            .then((res) => res.json())
            .then((data) => {
                if (data.user) setUser(data.user);
            })
            .catch(() => setUser(null));
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch("http://localhost:5050/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Ensures cookies are sent
            body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
            const data = await res.json();
            setUser(data.user);
        } else {
            throw new Error("Invalid credentials");
        }
    };

    const logout = async () => {
        await fetch("http://localhost:5050/auth/logout", {
            method: "POST",
            credentials: "include", // Ensures cookie is cleared
        });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
