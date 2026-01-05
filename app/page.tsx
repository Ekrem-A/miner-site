import React from 'react';
import ProductsSection from '@/app/products/page';
import { Hero } from './components/common/Hero';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

export default function MiningASICShop() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-cyan-800 text-white">
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
