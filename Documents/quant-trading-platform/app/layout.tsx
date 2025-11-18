import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IQuant',
  description: 'Professional quantitative trading platform with options arbitrage and equity strategies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Top Bar */}
            <header className="h-16 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] flex items-center justify-between px-6 sticky top-0 z-30">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold">IQuant</h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <div className="content-wrapper">
                {children}
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] py-4">
              <div className="px-6">
                <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
                  © 2025 IQuant. For educational purposes only.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
