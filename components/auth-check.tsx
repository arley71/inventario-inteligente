"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const PUBLIC_PATHS = ["/login"]

export function AuthCheck({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isLoading) return

    const isPublicPath = PUBLIC_PATHS.includes(pathname)

    if (!user && !isPublicPath) {
      router.push("/login")
    }
  }, [user, isLoading, pathname, router, mounted])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Cargando...</div>
      </div>
    )
  }

  if (!user && pathname !== "/login") {
    return null
  }

  return <>{children}</>
}
