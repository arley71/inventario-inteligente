"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { loginAction } from "@/app/acciones/auth"

export type UserRole = "admin" | "cajero"

export interface User {
  id: string
  name: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<User | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("auth_user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem("auth_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<User | null> => {
    const userFromDb = await loginAction(username, password);

    if (userFromDb) {
      setUser(userFromDb)
      localStorage.setItem("auth_user", JSON.stringify(userFromDb))
      return userFromDb
    }
    return null
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("auth_user")
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
