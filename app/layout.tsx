import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { InventoryProvider } from '@/lib/inventory-context'
import { AuthCheck } from '@/components/auth-check'
import { AppLayout } from '@/components/app-layout'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" })

export const metadata: Metadata = {
  title: 'Mi Tienda - Stock Control',
  description: 'Sistema de inventario para revuelteria y abarrotes con punto de venta y analisis de calidad con IA',
}

export const viewport = {
  themeColor: '#2D5A27',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <InventoryProvider>
            <AuthCheck>
              <AppLayout>
                {children}
              </AppLayout>
            </AuthCheck>
          </InventoryProvider>
        </AuthProvider>
        <Toaster richColors position="top-right" />
        <Analytics />
      </body>
    </html>
  )
}
