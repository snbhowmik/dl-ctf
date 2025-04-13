import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "DarkLead! CTF",
  description: "Shadow Apocalypse CTF 2025 by DarkLead! Community",
  keywords: ["DarkLead", "Community", "Cybersecurity", "Open Source"],
  authors: [{ name: "Gowthaman" }, { name: "Subir" }, { name: "Mehbub" }, { name: "Aflah" }, { name: "Nandakishore" }],
  icons: {
    icon: '/DL.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
