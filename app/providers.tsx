'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'white',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-body)',
            borderRadius: '12px'
          }
        }}
      />
    </SessionProvider>
  )
}
