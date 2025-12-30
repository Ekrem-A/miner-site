import { getProducts } from '../../../lib/getProducts';
import React from 'react';

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = params;
  let product = null;
  try {
    const products = await getProducts();
    product = products.find((p: any) => String(p.id) === id);
  } catch (e) {
    product = null;
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-gray-400">
        Ürün bulunamadı.
      </div>
    );
  }

  return (
    <section className="py-20 bg-slate-900/50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-800/60 rounded-2xl p-8 shadow-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-80 h-80 object-cover rounded-xl border border-cyan-700"
          />
          <div className="flex-1">
            <h1 className="orbitron text-3xl font-bold text-cyan-300 mb-4">{product.name}</h1>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Hashrate:</span>
                <span className="font-semibold text-cyan-300">{product.hashrate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Güç Tüketimi:</span>
                <span className="font-semibold">{product.power}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Verimlilik:</span>
                <span className="font-semibold">{product.efficiency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Stok:</span>
                <span className="font-semibold">{product.stock}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-cyan-500/20">
              <div>
                <span className="text-sm text-gray-400">Fiyat</span>
                <p className="orbitron text-2xl font-bold text-cyan-400">{product.price}</p>
              </div>
              <button className="bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-6 py-3 rounded-xl font-semibold transition-all glow-hover">
                Sepete Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
