import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RoleWithAI: Your Career Co-Pilot',
  description: 'A supportive assistant that helps you navigate the 2026 job market with truth scores and ghost risk insights.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#1B3B5A', // Deep Marine
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
