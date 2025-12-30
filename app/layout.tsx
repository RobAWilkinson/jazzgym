import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = {
  title: "JazzGym - Chord Flashcards",
  description: "Practice jazz guitar chords with timed flashcards",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                  <Link href="/">JazzGym</Link>
                </h1>
                <nav className="flex gap-4">
                  <Link
                    href="/"
                    className="text-sm font-medium hover:underline"
                  >
                    Practice
                  </Link>
                  <Link
                    href="/settings"
                    className="text-sm font-medium hover:underline"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/history"
                    className="text-sm font-medium hover:underline"
                  >
                    History
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
