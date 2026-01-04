import { Header } from '@/app/components/common/Header';
import { Footer } from '@/app/components/common/Footer';

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
