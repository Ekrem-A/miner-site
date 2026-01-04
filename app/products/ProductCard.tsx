'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string | number;
    name: string;
    brand?: string;
    price?: number | string;
    image_urls?: string[];
    image?: string;
    in_stock?: boolean;
    stock_quantity?: number;
    dailyProfit?: number | null;
    profitData?: {
      profitPerDayValue: number;
      algorithm?: string;
      hashrate?: string;
      power?: string;
    } | null;
  };
  idx: number;
}

export default function ProductCard({ product, idx }: ProductCardProps) {
  const dailyProfit = product.dailyProfit;
  const hasProfit = dailyProfit !== null && dailyProfit !== undefined;
  const isPositiveProfit = hasProfit && dailyProfit > 0;

  return (
    <Link 
      href={`/products/${product.id}`} 
      className={`product-card card-glow rounded-2xl overflow-hidden glow-hover fade-in stagger-${(idx % 6) + 1} cursor-pointer block group relative`}
    >
      <div className="relative h-64 bg-slate-900/50 overflow-hidden">
        <img 
          src={product.image_urls?.[0] || product.image || '/placeholder.png'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Stock Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            product.in_stock ? "bg-green-500/80" : "bg-yellow-500/80"
          }`}>
            {product.in_stock ? "Stokta" : "Tükendi"}
          </span>
        </div>

        {/* Daily Profit Badge - Sol üst köşe */}
        {hasProfit && (
          <div className="absolute top-4 left-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm ${
              isPositiveProfit 
                ? 'bg-green-500/90 text-white shadow-lg shadow-green-500/30' 
                : 'bg-red-500/90 text-white shadow-lg shadow-red-500/30'
            }`}>
              {isPositiveProfit ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>${Math.abs(dailyProfit).toFixed(2)}</span>
              <span className="text-xs opacity-80">/gün</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="orbitron text-xl font-bold mb-3 text-cyan-300 group-hover:text-cyan-200 transition-colors">
          {product.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Marka:</span>
            <span className="font-semibold text-cyan-300">{product.brand || '-'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Stok:</span>
            <span className="font-semibold">{product.stock_quantity || 0} adet</span>
          </div>
          
          {/* Profit bilgisi detayları */}
          {hasProfit && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Günlük Getiri:</span>
              <span className={`font-bold ${isPositiveProfit ? 'text-green-400' : 'text-red-400'}`}>
                ${dailyProfit.toFixed(2)}/gün
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-cyan-500/20">
          <div>
            <span className="text-sm text-gray-400">Fiyat</span>
            <p className="orbitron text-2xl font-bold text-cyan-400">
              {typeof product.price === 'number' 
                ? product.price.toLocaleString('tr-TR') 
                : product.price} ₺
            </p>
          </div>
          
          {/* ROI Indicator */}
          {hasProfit && typeof product.price === 'number' && product.price > 0 && (
            <div className="text-right">
              <span className="text-xs text-gray-500">Tahmini ROI</span>
              <p className="text-sm font-semibold text-amber-400">
                ~{Math.ceil(product.price / (dailyProfit * 35.5))} gün
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
