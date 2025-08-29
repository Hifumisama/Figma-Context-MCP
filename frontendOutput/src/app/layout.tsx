import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '800'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'John Doe - Product Designer',
  description: 'Portfolio de John Doe, Product Designer basé aux Pays-Bas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${poppins.variable} font-poppins`}>{children}</body>
    </html>
  )
}
