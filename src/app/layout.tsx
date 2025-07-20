import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner" // New import for Sonner

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors /> {/* Added richColors prop for better styling */}
      </body>
    </html>
  )
}
