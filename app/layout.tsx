import './globals.css'
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google'
import { Providers } from './providers'

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
})

export const metadata = {
  title: 'VocabRise | Master English Vocabulary',
  description: 'Join thousands of learners building their vocabulary through community, streaks, and daily challenges.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${bricolageGrotesque.variable} ${dmSans.variable}`}
    >
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}