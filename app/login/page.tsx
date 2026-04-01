"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Lock, User, Eye, EyeOff, ShoppingBag, Leaf } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  const { user, login, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && user) {
      router.push(user.role === "admin" ? "/admin/panel" : "/cajero/revuelteria")
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const loggedUser = await login(username, password)
      if (loggedUser) {
        router.push(loggedUser.role === "admin" ? "/admin/panel" : "/cajero/revuelteria")
      } else {
        setError("Usuario o contraseña incorrectos")
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error(err)
      setError("Error de conexión al servidor")
      setIsSubmitting(false)
    }
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B4332] via-[#2D5A27] to-[#40916C]">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-white/80 font-medium">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B4332] via-[#2D5A27] to-[#40916C] p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#A8E063]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* Floating leaves decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Leaf className="absolute top-20 left-[10%] w-8 h-8 text-white/10 rotate-12 animate-pulse" />
        <Leaf className="absolute bottom-32 right-[15%] w-6 h-6 text-white/10 -rotate-12 animate-pulse delay-300" />
        <Leaf className="absolute top-1/2 right-[5%] w-5 h-5 text-white/10 rotate-45 animate-pulse delay-500" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm mb-5 relative overflow-hidden">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="w-20 h-20 object-contain relative z-10 rounded-xl" 
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Stock Control</h1>
          <p className="text-white/70 text-sm mt-2 font-light">Sistema de gestión para tu supermercado</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Bienvenido de nuevo</h2>
            <p className="text-gray-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="relative">
              <div className={`relative transition-all duration-300 ${focusedField === 'username' ? 'transform -translate-y-1' : ''}`}>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className="peer h-12 w-full px-4 pl-12 pt-4 pb-2 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-800 placeholder-transparent focus:outline-none focus:border-[#2D5A27] focus:bg-white transition-all duration-200"
                  placeholder="Usuario"
                  required
                />
                <label 
                  htmlFor="username"
                  className={`absolute left-12 transition-all duration-200 pointer-events-none ${
                    focusedField === 'username' || username
                      ? 'top-2 text-xs text-[#2D5A27] font-medium'
                      : 'top-3.5 text-sm text-gray-400'
                  }`}
                >
                  Usuario
                </label>
                <User 
                  className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                    focusedField === 'username' ? 'text-[#2D5A27]' : 'text-gray-400'
                  }`} 
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform -translate-y-1' : ''}`}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="peer h-12 w-full px-4 pl-12 pt-4 pb-2 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-800 placeholder-transparent focus:outline-none focus:border-[#2D5A27] focus:bg-white transition-all duration-200"
                  placeholder="Contraseña"
                  required
                />
                <label 
                  htmlFor="password"
                  className={`absolute left-12 transition-all duration-200 pointer-events-none ${
                    focusedField === 'password' || password
                      ? 'top-2 text-xs text-[#2D5A27] font-medium'
                      : 'top-3.5 text-sm text-gray-400'
                  }`}
                >
                  Contraseña
                </label>
                <Lock 
                  className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-[#2D5A27]' : 'text-gray-400'
                  }`} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D5A27] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center animate-shake">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-12 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                isSubmitting
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#2D5A27] to-[#40916C] hover:from-[#1B4332] hover:to-[#2D5A27] hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verificando...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </button>

            {!username || !password ? (
              <p className="text-center text-xs text-gray-400">* Los campos son obligatorios</p>
            ) : null}
          </form>

          {/* Demo Accounts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gradient-to-br from-[#2D5A27]/5 to-[#40916C]/5 p-3 border border-[#2D5A27]/10 hover:border-[#2D5A27]/30 transition-colors cursor-default">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#2D5A27]"></div>
                <p className="text-xs font-semibold text-[#2D5A27]">Administrador</p>
              </div>
              <p className="text-[10px] text-gray-500 font-mono">admin / admin123</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#40916C]/5 to-[#A8E063]/5 p-3 border border-[#40916C]/10 hover:border-[#40916C]/30 transition-colors cursor-default">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#40916C]"></div>
                <p className="text-xs font-semibold text-[#40916C]">Cajero</p>
              </div>
              <p className="text-[10px] text-gray-500 font-mono">cajero / cajero123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 Stock Control
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  )
}
