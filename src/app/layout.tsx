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
        {children}
      </body>
    </html>
  )
}

// SEO TODO: Add Open Graph tags for social sharing
