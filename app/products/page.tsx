import React from 'react';
import { getProducts } from '../../lib/getProducts';

export default async function ProductsSection() {
  let products = [];
  try {
    products = await getProducts();
  } catch (e) {
    // Hata durumunda boş dizi döner, isterseniz hata mesajı gösterebilirsiniz
    products = [];
  }

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
          {products && products.length > 0 ? (
            products.map((product: any, idx: number) => (
              <div key={product.id} className={`product-card card-glow rounded-2xl overflow-hidden glow-hover fade-in stagger-${(idx % 6) + 1}`}>
                <div className="relative h-64 bg-slate-900/50 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      product.stock === "Stokta" ? "bg-green-500/80" : "bg-yellow-500/80"
                    }`}>
                      {product.stock}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="orbitron text-xl font-bold mb-3 text-cyan-300">{product.name}</h3>
                  <div className="space-y-2 mb-4">
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
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-400">Ürün bulunamadı.</div>
          )}
        </div>
      </div>
    </section>
  );
}




