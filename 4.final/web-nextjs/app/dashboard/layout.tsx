import { ThreadLineDecorative } from '@/components/graphics/ThreadLine';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-background sticky top-0 z-50 overflow-hidden">
        {/* Subtle decorative thread line in header */}
        <div className="absolute bottom-0 left-0 right-0 opacity-10">
          <ThreadLineDecorative variant="subtle" className="w-full" />
        </div>
        <div className="flex h-16 items-center px-4 md:px-8 relative z-10">
          <Link href="/" className="font-bold text-lg md:text-xl font-titles">
            CHAMANA
          </Link>
          <nav className="flex items-center space-x-2 md:space-x-4 ml-4 md:ml-8">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-xs md:text-sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/reportes">
              <Button variant="ghost" className="text-xs md:text-sm">
                Reportes
              </Button>
            </Link>
            <Link href="/procesos">
              <Button variant="ghost" className="text-xs md:text-sm">
                Procesos
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </div>
  );
}
