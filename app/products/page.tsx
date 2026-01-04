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

// Ürün adından model, hashrate, varyant bilgilerini çıkar
function parseProductName(name: string): {
  model: string;
  hashrate: number | null;
  hashrateUnit: string;
  isHydro: boolean;
  isPro: boolean;
  isXp: boolean;
  isPlus: boolean;
  isImmersion: boolean;
} {
  const normalized = name.toLowerCase().replace(/[-_]/g, ' ');
  
  // Model çıkar (S21, S19, Z15, L11, T21, D3, etc.)
  const modelMatch = normalized.match(/\b(s21e?|s23|s19|z15|t21|l11|l9|d3|d1|x9|x44|ae3|ae2|ks\d+)\b/i);
  const model = modelMatch ? modelMatch[1].toLowerCase() : '';
  
  // Hashrate çıkar
  let hashrate: number | null = null;
  let hashrateUnit = '';
  
  const hashratePatterns = [
    /(\d+(?:\.\d+)?)\s*(ph|th|gh|mh|kh)(?:\/s)?/i,
    /\(\s*(\d+(?:\.\d+)?)\s*(ph|th|gh|mh|kh)\s*\)/i,
  ];
  
  for (const pattern of hashratePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      hashrate = parseFloat(match[1]);
      hashrateUnit = match[2].toLowerCase();
      break;
    }
  }
  
  return {
    model,
    hashrate,
    hashrateUnit,
    isHydro: /\bhyd(?:ro)?\b/i.test(normalized),
    isPro: /\bpro\b/i.test(normalized),
    isXp: /\bxp\b/i.test(normalized),
    isPlus: /\+|\bplus\b/i.test(normalized),
    isImmersion: /\bimmer(?:sion)?\b/i.test(normalized),
  };
}

// İki ürün arasındaki eşleşme skorunu hesapla
function calculateMatchScore(
  product: ReturnType<typeof parseProductName>,
  miner: ReturnType<typeof parseProductName>
): number {
  let score = 0;
  
  // Model eşleşmesi (en önemli) - 5 puan
  if (product.model && miner.model) {
    if (product.model === miner.model) {
      score += 5;
    } else if (product.model.replace('e', '') === miner.model.replace('e', '')) {
      score += 3;
    }
  }
  
  // Varyant eşleşmesi
  if (product.isHydro === miner.isHydro) score += 2;
  if (product.isPro === miner.isPro) score += 2;
  if (product.isXp === miner.isXp) score += 2;
  if (product.isPlus === miner.isPlus) score += 1;
  if (product.isImmersion === miner.isImmersion) score += 1;
  
  // Hashrate eşleşmesi
  if (product.hashrate && miner.hashrate && product.hashrateUnit === miner.hashrateUnit) {
    if (product.hashrate === miner.hashrate) {
      score += 4;
    } else if (Math.abs(product.hashrate - miner.hashrate) / miner.hashrate < 0.1) {
      score += 2;
    } else if (Math.abs(product.hashrate - miner.hashrate) / miner.hashrate < 0.2) {
      score += 1;
    }
  }
  
  // Varyant uyumsuzluğu ceza
  if (product.isHydro !== miner.isHydro) score -= 3;
  if (product.isPro !== miner.isPro) score -= 2;
  if (product.isXp !== miner.isXp) score -= 2;
  
  return score;
}

// Ürün adına göre profit eşleştir - Gelişmiş versiyon
function matchProfitToProduct(product: any, profitData: any[]) {
  if (!profitData || profitData.length === 0) return null;
  
  const productName = (product.name || '').toLowerCase().trim();
  const productInfo = parseProductName(productName);
  
  let bestMatch: any = null;
  let bestScore = 0;
  
  for (const miner of profitData) {
    const minerInfo = parseProductName(miner.name || '');
    const score = calculateMatchScore(productInfo, minerInfo);
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = miner;
    }
  }
  
  if (bestMatch && bestScore >= 3) {
    return {
      ...bestMatch,
      profitPerDayValue: bestMatch.dailyProfitUsd,
      matchScore: bestScore
    };
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




