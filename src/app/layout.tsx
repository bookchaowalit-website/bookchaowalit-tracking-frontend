import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TrackIt - Your Personal Content Tracker",
  description: "Track your manga, anime, movies, books, games, and more all in one place",
  keywords: ["tracking", "anime", "manga", "movies", "books", "games", "watch list"],
  authors: [{ name: "TrackIt" }],
  openGraph: {
    title: "TrackIt - Your Personal Content Tracker",
    description: "Track your manga, anime, movies, books, games, and more all in one place",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
  {/* Structured Data for SEO */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Tracking',
        url: 'https://bookchaowalit-tracking.vercel.app',
        description: 'Tracking by Bookchaowalit - A modern web application',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        author: {
          '@type': 'Person',
          name: 'Bookchaowalit',
          url: 'https://bookchaowalit.com'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Bookchaowalit',
          url: 'https://bookchaowalit.com'
        }
      })
    }}
  />

  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Tracking',
        url: 'https://bookchaowalit-tracking.vercel.app',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://bookchaowalit-tracking.vercel.app/more-projects',
          'query-input': 'required name=search_term'
        }
      })
    }}
  />


        {children}
      </body>
    </html>
  )
}

// SEO TODO: Add Open Graph tags for social sharing
