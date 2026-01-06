import Link from "next/link";
import { ChevronRight, Zap, Shield, TrendingUp, Award } from "lucide-react";


export function Hero() {
  const brands = [
    { name: "Bitmain", icon: Zap }, 
    { name: "MicroBT", icon: Shield },
    { name: "Canaan", icon: TrendingUp },
    { name: "Innosilicon", icon: Award },


    ];  return (
<section className="pt-32 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Brand Scroll Bar */}
          <div className="overflow-hidden mb-16">
            <div className="flex space-x-12 scroll-animation">
              {[...brands, ...brands].map((brand, index) => {
                const Icon = brand.icon;
                return (
                  <div key={index} className="flex items-center space-x-3 whitespace-nowrap bg-gray-100 px-6 py-3 rounded-full border border-cyan-500/30">
                    <Icon className="w-5 h-5 text-cyan-600" />
                    <span className="text-gray-700 font-semibold">{brand.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center mb-16 fade-in">
            <h2 className="orbitron text-5xl md:text-7xl font-black mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500">
                MINING GÜCÜNDEKİ
              </span>
              <br />
              <span className="text-gray-800">YENİ ÇAĞA HOŞ GELDİNİZ</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Profesyonel kripto madenciliği için en yeni ve güçlü ASIC cihazları. 
              Yüksek hashrate, düşük enerji tüketimi, maksimum karlılık.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/products" className="animated-gradient px-8 py-4 rounded-full font-bold text-lg flex items-center space-x-2 glow-hover text-white">
                <span>Ürünleri İncele</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/mining" className="border-2 border-cyan-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-cyan-500/10 transition-colors text-cyan-600">
                Daha Fazla Bilgi
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Zap, title: "Yüksek Performans", desc: "En son teknoloji" },
              { icon: Shield, title: "Güvenli Alışveriş", desc: "SSL sertifikalı" },
              { icon: TrendingUp, title: "Karlılık Garantisi", desc: "ROI hesaplama" },
              { icon: Award, title: "Resmi Distribütör", desc: "Orijinal ürünler" }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className={`bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-cyan-300 transition-all fade-in stagger-${idx + 1}`}>
                  <Icon className="w-10 h-10 text-cyan-500 mb-4" />
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-500 text-sm">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
}