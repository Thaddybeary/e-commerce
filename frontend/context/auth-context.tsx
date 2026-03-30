"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { authAPI } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      authAPI
        .getProfile()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password })
    localStorage.setItem("accessToken", res.data.tokens.accessToken)
    localStorage.setItem("refreshToken", res.data.tokens.refreshToken)
    setUser(res.data.user)
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await authAPI.register({ name, email, password })
    localStorage.setItem("accessToken", res.data.tokens.accessToken)
    localStorage.setItem("refreshToken", res.data.tokens.refreshToken)
    setUser(res.data.user)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken")
    if (refreshToken) {
      await authAPI.logout(refreshToken).catch(() => {})
    }
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
