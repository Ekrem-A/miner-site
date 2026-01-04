import React from 'react';
import Link from 'next/link';
import { fetchProducts } from '@/lib/getProducts';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import ProductCard from './ProductCard';

// ASICMinerValue'dan tüm profitability verilerini çek
async function fetchAllProfits() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/asic-profitability`, {
      next: { revalidate: 86400 }, // 24 saat cache (günlük güncelleme)
      cache: 'force-cache'
    });
    if (response.ok) {
      const data = await response.json();
      return data.miners || [];
    }
  } catch (e) {
    console.error('Profit verileri alınamadı:', e);
  }
  return [];
}

// Ürün slug'ı oluştur
function createProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Ürün adına göre profit eşleştir
function matchProfitToProduct(product: any, profitData: any[]) {
  if (!profitData || profitData.length === 0) return null;
  
  const productName = (product.name || '').toLowerCase().trim();
  const productSlug = createProductSlug(product.name || '');
  
  // Normalize fonksiyonu - karşılaştırma için
  const normalize = (s: string) => s.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/antminer/g, '')
    .replace(/bitmain/g, '');
  
  const normalizedProduct = normalize(productName);
  
  // 1. Slug eşleştirmesi (en güvenilir)
  for (const miner of profitData) {
    const minerSlug = miner.slug || '';
    const normalizedMiner = normalize(miner.name || '');
    
    // Direkt slug eşleşmesi
    if (minerSlug === productSlug || 
        productSlug.includes(minerSlug) || 
        minerSlug.includes(productSlug)) {
      return {
        ...miner,
        profitPerDayValue: miner.dailyProfitUsd
      };
    }
    
    // Normalize edilmiş isim eşleşmesi
    if (normalizedProduct === normalizedMiner ||
        normalizedProduct.includes(normalizedMiner) ||
        normalizedMiner.includes(normalizedProduct)) {
      return {
        ...miner,
        profitPerDayValue: miner.dailyProfitUsd
      };
    }
  }
  
  // 2. Model numarası ile eşleştir (z15, s21, s19, t21, d3, etc.)
  const modelPatterns = [
    { pattern: /z15\s*pro/i, key: 'z15-pro' },
    { pattern: /z15(?!\s*pro)/i, key: 'z15' },
    { pattern: /s21e?\s*xp\+?\s*hyd.*?(\d{3,4})/i, key: 's21-xp-hyd' },
    { pattern: /s21\s*xp\+?\s*hyd.*?(\d{3,4})/i, key: 's21-xp-hyd' },
    { pattern: /s21\s*xp.*?(\d{3,4})/i, key: 's21-xp' },
    { pattern: /s21\s*pro/i, key: 's21-pro' },
    { pattern: /s21e/i, key: 's21e' },
    { pattern: /s21(?!\s*xp|\s*pro|\s*e)/i, key: 's21' },
    { pattern: /s19.*k.*pro/i, key: 's19-k-pro' },
    { pattern: /s19\s*xp\+?\s*hyd/i, key: 's19-xp-hyd' },
    { pattern: /s19\s*xp/i, key: 's19-xp' },
    { pattern: /s19(?!\s*xp|\s*k)/i, key: 's19' },
    { pattern: /t21/i, key: 't21' },
    { pattern: /l11/i, key: 'l11' },
    { pattern: /l9/i, key: 'l9' },
    { pattern: /s23/i, key: 's23' },
    { pattern: /d3|volcminer/i, key: 'd3' },
  ];
  
  for (const { pattern, key } of modelPatterns) {
    if (pattern.test(productName)) {
      // Hashrate'i de kontrol et
      const hashrateMatch = productName.match(/(\d{3,4})\s*(?:th|gh|kh)/i);
      const targetHashrate = hashrateMatch ? hashrateMatch[1] : null;
      
      for (const miner of profitData) {
        const minerSlug = (miner.slug || '').toLowerCase();
        const minerName = (miner.name || '').toLowerCase();
        
        if (minerSlug.includes(key.replace(/-/g, '')) || 
            minerSlug.includes(key) ||
            minerName.includes(key.replace(/-/g, ' '))) {
          
          // Hashrate eşleşmesi varsa daha iyi
          if (targetHashrate) {
            if (minerSlug.includes(targetHashrate) || minerName.includes(targetHashrate)) {
              return {
                ...miner,
                profitPerDayValue: miner.dailyProfitUsd
              };
            }
          } else {
            return {
              ...miner,
              profitPerDayValue: miner.dailyProfitUsd
            };
          }
        }
      }
      
      // Hashrate olmadan sadece model ile eşleştir
      for (const miner of profitData) {
        const minerSlug = (miner.slug || '').toLowerCase();
        if (minerSlug.includes(key.replace(/-/g, ''))) {
          return {
            ...miner,
            profitPerDayValue: miner.dailyProfitUsd
          };
        }
      }
    }
  }
  
  // 3. VolcMiner özel eşleştirme
  if (productName.includes('volcminer') || productName.includes('volc') || productName.includes('d3')) {
    for (const miner of profitData) {
      if ((miner.slug || '').toLowerCase().includes('volcminer') ||
          (miner.slug || '').toLowerCase().includes('d3')) {
        return {
          ...miner,
          profitPerDayValue: miner.dailyProfitUsd
        };
      }
    }
  }
  
  return null;
}

export default async function ProductsSection() {
  let products: any[] = [];
  let profitData: any[] = [];
  
  try {
    [products, profitData] = await Promise.all([
      fetchProducts(),
      fetchAllProfits()
    ]);
  } catch (e) {
    products = [];
    profitData = [];
  }

  // Her ürüne profit bilgisi ekle
  const productsWithProfit = products.map(product => {
    const matchedProfit = matchProfitToProduct(product, profitData);
    return {
      ...product,
      dailyProfit: matchedProfit?.profitPerDayValue || null,
      profitData: matchedProfit
    };
  });

  return (
    <section id="products" className="py-20 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="orbitron text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400">
            POPÜLER ÜRÜNLER
          </h2>
          <p className="text-gray-400 text-lg">En çok tercih edilen ASIC madencilik cihazları</p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {productsWithProfit && productsWithProfit.length > 0 ? (
            productsWithProfit.map((product: any, idx: number) => (
              <ProductCard key={product.id} product={product} idx={idx} />
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-400">Ürün bulunamadı.</div>
          )}
        </div>
      </div>
    </section>
  );
}




