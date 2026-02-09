import { BottomNav } from '@/components/store/BottomNav';
import { StoreFooter } from '@/components/store/StoreFooter';
import { StoreNavbar } from '@/components/store/StoreNavbar';
import { WhatsAppFab } from '@/components/store/WhatsAppFab';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreNavbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <StoreFooter />
      <BottomNav />
      <WhatsAppFab />
    </div>
  );
}
