import { fetchProducts } from '@/lib/getProducts';
import { fetchMinerProfits, findBestProfitMatch } from '@/lib/getProfitData';
import Link from 'next/link';
import { Product } from '@/types';
import ProductTabs from './ProductTabs';
import ProductProfitDisplay from './ProductProfitDisplay';

export const revalidate = 3600; // Her saat yeniden oluştur

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  let product: Product | null = null;
  let relatedProducts: Product[] = [];
  let profitData: any = null;
  
  try {
    // Paralel olarak ürünleri ve profit verilerini çek
    const [products, allProfits] = await Promise.all([
      fetchProducts(),
      fetchMinerProfits()
    ]);
    
    product = products.find((p) => String(p.id) === id) || null;
    
    if (product) {
      // İlgili ürünleri bul
      relatedProducts = products
        .filter((p) => p.category_id === product!.category_id && p.id !== product!.id)
        .slice(0, 3);
      
      // Profit verisini eşleştir
      const fullName = `${product.brand || ''} ${product.name}`.trim();
      const matchedProfit = findBestProfitMatch(fullName, allProfits);
      
      if (matchedProfit) {
        profitData = {
          ...matchedProfit,
          profitPerDayValue: matchedProfit.dailyProfitUsd,
        };
        console.log(`✅ Profit matched for ${fullName}: $${matchedProfit.dailyProfitUsd}/day`);
      } else {
        console.log(`❌ No profit match for ${fullName}`);
      }
    }
  } catch (e) {
    console.error('Veri çekme hatası:', e);
    product = null;
  }

  if (!product) {
    return (
      
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-400 mb-4">Ürün Bulunamadı</h1>
          <Link href="/products" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            ← Ürünlere Dön
          </Link>
        </div>
      </div>
    );
  }

  const images = product.image_urls || [product.image || '/placeholder.png'];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-cyan-400 transition-colors">Ürünler</Link>
          <span>/</span>
          <span className="text-cyan-400">{product.name}</span>
        </nav>
      </div>

      {/* SECTION 1: Ürün Görselleri ve Temel Bilgiler */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Sol: Görsel Galerisi */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-slate-800/50 rounded-2xl overflow-hidden border border-cyan-500/20">
                <img
                  src={images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discount_percentage && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    %{product.discount_percentage} İNDİRİM
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.in_stock ? "bg-green-500" : "bg-red-500"
                  } text-white`}>
                    {product.in_stock ? "Stokta" : "Tükendi"}
                  </span>
                </div>
              </div>
              
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img: string, idx: number) => (
                    <div 
                      key={idx} 
                      className={`aspect-square bg-slate-800/50 rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:border-cyan-400 ${
                        idx === 0 ? 'border-cyan-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sağ: Temel Bilgiler */}
            <div className="space-y-6">
              <div>
                <p className="text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-2">{product.brand}</p>
                <h1 className="orbitron text-3xl md:text-4xl font-bold text-white mb-4">{product.name}</h1>
                
                {/* Günlük Kar Gösterimi */}
                {profitData && (
                  <ProductProfitDisplay profitData={profitData} />
                )}
                
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-slate-700/50 text-gray-300 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-cyan-500/20">
                <div className="flex items-end gap-4">
                  {product.original_price && (
                    <span className="text-2xl text-gray-500 line-through">
                      {product.original_price} ₺
                    </span>
                  )}
                  <span className="orbitron text-4xl font-bold text-cyan-400">
                    {product.price} ₺
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">KDV Dahil</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-300">
                    {product.in_stock ? `${product.stock_quantity || 0} adet stokta` : 'Stokta yok'}
                  </span>
                </div>
              </div>

              {product.description && (
                <p className="text-gray-300 leading-relaxed">{product.description}</p>
              )}

              <div className="flex gap-4">
                <a 
                  href={`https://wa.me/XXXXXXXXX?text=${encodeURIComponent(`Merhaba, ${product.name} ürünü hakkında bilgi almak istiyorum.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 text-center flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp ile İletişime Geç
                </a>
                <button className="py-4 px-6 rounded-xl font-bold text-lg bg-slate-700 hover:bg-slate-600 text-white transition-all">
                  ❤️
                </button>
              </div>

              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                <p className="text-gray-400 text-sm">
                  📞 Sipariş ve bilgi için: <span className="text-cyan-400 font-semibold">+90 XXX XXX XX XX</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Tab'lı Detay Bölümü */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductTabs product={{
            name: product.name,
            brand: product.brand,
            description: product.description,
            specs: product.specs,
            tags: product.tags,
            algorithm: product.algorithm,
            coin: product.coin,
            hashrate: product.hashrate,
            hashrate_unit: product.hashrate_unit,
            power_consumption: product.power_consumption,
          }} />
        </div>
      </section>

      {/* SECTION 3: Benzer Ürünler */}
      {relatedProducts.length > 0 && (
        <section className="py-12 bg-slate-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="orbitron text-2xl md:text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="text-cyan-400">🔗</span> Benzer Ürünler
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link 
                  href={`/products/${relatedProduct.id}`}
                  key={relatedProduct.id}
                  className="group bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-all"
                >
                  <div className="aspect-video bg-slate-900/50 overflow-hidden">
                    <img 
                      src={relatedProduct.image_urls?.[0] || relatedProduct.image || '/placeholder.png'} 
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-cyan-400 text-xs font-semibold uppercase mb-1">{relatedProduct.brand}</p>
                    <h3 className="text-white font-bold mb-2 group-hover:text-cyan-300 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="orbitron text-xl font-bold text-cyan-400">
                        {relatedProduct.price} ₺
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        relatedProduct.in_stock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {relatedProduct.in_stock ? 'Stokta' : 'Tükendi'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 bg-linear-to-r from-cyan-900/30 to-blue-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="orbitron text-2xl md:text-3xl font-bold text-white mb-4">
            Sorularınız mı var?
          </h2>
          <p className="text-gray-300 mb-6">
            Ürün hakkında detaylı bilgi almak için bizimle iletişime geçebilirsiniz.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            İletişime Geç
          </Link>
        </div>
      </section>
    </div>
  );
}
