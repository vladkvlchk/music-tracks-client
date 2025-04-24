import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Music Track Manager",
  description: "Manage your music tracks with ease",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className + "fixed inset-0 -z-10 bg-gradient-to-b from-white to-gray-50 [background-image:radial-gradient(#e5e7eb_1px,transparent_0)] [background-size:20px_20px]"}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
