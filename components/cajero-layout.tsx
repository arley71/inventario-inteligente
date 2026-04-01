"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { CajeroSidebar } from "@/components/cajero-sidebar"
import { CajeroMobileHeader } from "@/components/cajero-mobile-header"

export function CajeroLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <>
      <CajeroSidebar />
      <CajeroMobileHeader />
      <main className="min-h-screen pt-14 lg:pt-0 lg:pl-64">
        {children}
      </main>
    </>
  )
}
