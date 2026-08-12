import type { Metadata } from 'next'
import HomeSearch from './HomeSearch'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default function Page() {
  return <HomeSearch />
}
