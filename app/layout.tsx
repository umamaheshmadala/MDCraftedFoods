import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Badam Reserve | MD Crafted Foods',
  description: 'Premium Instant Badam Milk Mix — Thick. Rich. Velvety.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
