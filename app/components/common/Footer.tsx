import { Menu, X, ShoppingCart, User, Search, Zap, Shield, TrendingUp, Award, ChevronRight, Cpu, Server, Layers } from 'lucide-react';

export function Footer() {
  return (
    <div>
        <footer className="bg-slate-950 border-t border-cyan-500/20 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="orbitron text-xl font-black text-cyan-400">ASIC STORE</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Türkiye'nin en güvenilir kripto madencilik ekipmanları tedarikçisi.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-cyan-300">Hızlı Erişim</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Anasayfa</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Ürünler</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">İletişim</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-cyan-300">Destek</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-300 transition-colors">SSS</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Kargo Takibi</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">İade Politikası</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Garanti</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-cyan-300">İletişim</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: info@asicstore.com</li>
                <li>Tel: +90 (212) 555 0000</li>
                <li>Adres: İstanbul, Türkiye</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-cyan-500/20 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 ASIC Store. Tüm hakları saklıdır.</p>
          </div>
        </div>
        </footer>
    </div>      
);
}
