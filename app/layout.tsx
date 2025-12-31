import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "JazzGym - Practice Flashcards",
  description: "Practice jazz guitar chords and scales with timed flashcards",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <header className="border-b">
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <h1 className="text-xl sm:text-2xl font-bold">
                    <Link href="/">JazzGym</Link>
                  </h1>
                  <nav className="flex flex-wrap gap-3 sm:gap-4 text-sm sm:text-base justify-center">
                    <Link
                      href="/"
                      className="font-medium hover:underline"
                    >
                      Home
                    </Link>
                    <Link
                      href="/chords"
                      className="font-medium hover:underline"
                    >
                      Chords
                    </Link>
                    <Link
                      href="/scales"
                      className="font-medium hover:underline"
                    >
                      Scales
                    </Link>
                    <Link
                      href="/history"
                      className="font-medium hover:underline"
                    >
                      Chord History
                    </Link>
                    <Link
                      href="/scales-history"
                      className="font-medium hover:underline"
                    >
                      Scale History
                    </Link>
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
