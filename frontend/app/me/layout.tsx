import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '마이페이지 - COMPANY COLOR',
  alternates: {
    canonical: '/me',
  },
}

export default function MeLayout({ children }: { children: ReactNode }) {
  return children
}
