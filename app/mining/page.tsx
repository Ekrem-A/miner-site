'use client';

import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Pickaxe, Zap, TrendingUp, Shield } from 'lucide-react';

export default function MiningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500/20 rounded-2xl mb-6">
              <Pickaxe className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="orbitron text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500 mb-4">
              MADENCİLİK REHBERİ
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Kripto para madenciliği hakkında bilmeniz gereken her şey
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Karlılık Hesaplama</h3>
              <p className="text-gray-400">
                Elektrik maliyeti, hashrate ve coin fiyatına göre günlük kazancınızı hesaplayın.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-colors">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Enerji Verimliliği</h3>
              <p className="text-gray-400">
                En verimli ASIC cihazlarını seçerek elektrik maliyetlerinizi minimize edin.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Güvenli Yatırım</h3>
              <p className="text-gray-400">
                Orijinal ve garantili ürünlerle güvenli madencilik yatırımı yapın.
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-slate-800/30 border border-cyan-500/20 rounded-2xl p-8">
            <h2 className="orbitron text-2xl font-bold text-cyan-400 mb-6">Madenciliğe Başlarken</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-white">1. Doğru Cihazı Seçin:</strong> Hangi kripto parayı kazacağınıza karar verin. 
                Bitcoin için SHA-256, Litecoin/Dogecoin için Scrypt, Zcash için Equihash algoritması kullanan cihazlar gereklidir.
              </p>
              <p>
                <strong className="text-white">2. Elektrik Maliyetini Hesaplayın:</strong> Madencilikte en büyük gider elektrik maliyetidir. 
                Türkiye'de ortalama 0.10$/kWh civarında elektrik maliyeti vardır.
              </p>
              <p>
                <strong className="text-white">3. Havuz Seçimi:</strong> Solo madencilik yerine havuz madenciliği tercih edin. 
                F2Pool, ViaBTC, AntPool gibi güvenilir havuzları değerlendirebilirsiniz.
              </p>
              <p>
                <strong className="text-white">4. Soğutma ve Gürültü:</strong> ASIC cihazları yüksek ısı ve gürültü üretir. 
                Uygun bir ortam hazırladığınızdan emin olun.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <a 
              href="/products" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
            >
              <Pickaxe className="w-5 h-5" />
              Madencilik Cihazlarını İncele
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
