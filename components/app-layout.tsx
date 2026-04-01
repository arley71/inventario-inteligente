"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { CajeroSidebar } from "@/components/cajero-sidebar"
import { CajeroMobileHeader } from "@/components/cajero-mobile-header"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"
  const isCajero = pathname.startsWith("/cajero")

  if (isLoginPage) {
    return <>{children}</>
  }

  if (isCajero) {
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

  return (
    <>
      <AppSidebar />
      <MobileHeader />
      <main className="min-h-screen pt-14 lg:pt-0 lg:pl-64">
        {children}
      </main>
    </>
  )
}
