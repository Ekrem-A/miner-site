import React from 'react';
import ProductsSection from '@/app/products/page';
import { Hero } from './components/common/Hero';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

export default function MiningASICShop() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-blue-950 text-white">
      {/* Header / TopBar */}
      <Header />

      <Hero />

      {/* Products Section */}  
      <ProductsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
