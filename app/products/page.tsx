import React from 'react';
import Link from 'next/link';
import { fetchProducts } from '@/lib/getProducts';
import { fetchMinerProfits, findBestProfitMatch, MinerProfitData } from '@/lib/getProfitData';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import ProductCard from './ProductCard';

export const revalidate = 3600; // Her saat yeniden oluştur (Vercel ISR)
export const dynamic = 'force-dynamic'; // Vercel'de dinamik render

export default async function ProductsSection() {
  let products: any[] = [];
  let profitData: MinerProfitData[] = [];
  
  try {
    // Paralel olarak hem ürünleri hem profit verilerini çek
    [products, profitData] = await Promise.all([
      fetchProducts(),
      fetchMinerProfits() // Artık direkt lib'den çekiyoruz, API fetch yok
    ]);
    
    console.log(`📦 Products: ${products.length}, Profit Data: ${profitData.length}`);
  } catch (e) {
    console.error('Veri çekme hatası:', e);
    products = [];
    profitData = [];
  }

  // Her ürüne profit bilgisi ekle (yeni eşleştirme fonksiyonu ile)
  const productsWithProfit = products.map(product => {
    const matchedProfit = findBestProfitMatch(product.name || '', profitData);
    return {
      ...product,
      dailyProfit: matchedProfit?.dailyProfitUsd || null,
      profitData: matchedProfit ? {
        ...matchedProfit,
        profitPerDayValue: matchedProfit.dailyProfitUsd
      } : null
    };
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section id="products" className="py-20 pt-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="orbitron text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-blue-600">
              POPÜLER ÜRÜNLER
            </h2>
            <p className="text-gray-600 text-lg">En çok tercih edilen ASIC madencilik cihazları</p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productsWithProfit && productsWithProfit.length > 0 ? (
              productsWithProfit.map((product: any, idx: number) => (
                <ProductCard key={product.id} product={product} idx={idx} />
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500">Ürün bulunamadı.</div>
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}




