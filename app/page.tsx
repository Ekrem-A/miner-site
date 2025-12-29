import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, User, Search, Zap, Shield, TrendingUp, Award, ChevronRight, Cpu, Server, Layers } from 'lucide-react';
import ProductsSection from '@/app/products/page';
import { Hero } from './components/common/Hero';
import {Header} from './components/common/Header';
const MiningASICShop = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-blue-950 text-white">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700;900&family=Orbitron:wght@400;500;700;900&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Exo 2', sans-serif;
        }

        .orbitron {
          font-family: 'Orbitron', sans-serif;
        }

        .animated-gradient {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 25%, #0e7490 50%, #155e75 75%, #164e63 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .glow {
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3),
                      0 0 40px rgba(6, 182, 212, 0.2),
                      0 0 60px rgba(6, 182, 212, 0.1);
        }

        .glow-hover {
          transition: all 0.3s ease;
        }

        .glow-hover:hover {
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.5),
                      0 0 60px rgba(6, 182, 212, 0.3),
                      0 0 90px rgba(6, 182, 212, 0.2);
          transform: translateY(-5px);
        }

        .text-glow {
          text-shadow: 0 0 10px rgba(6, 182, 212, 0.5),
                       0 0 20px rgba(6, 182, 212, 0.3);
        }

        .card-glow {
          background: rgba(6, 182, 212, 0.05);
          border: 1px solid rgba(6, 182, 212, 0.2);
          backdrop-filter: blur(10px);
        }

        .scroll-animation {
          animation: scroll 30s linear infinite;
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
        .stagger-5 { animation-delay: 0.5s; opacity: 0; }
        .stagger-6 { animation-delay: 0.6s; opacity: 0; }

        .product-card {
          position: relative;
          overflow: hidden;
        }

        .product-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3), transparent);
          transition: left 0.5s;
        }

        .product-card:hover::before {
          left: 100%;
        }

        .mesh-gradient {
          background: 
            radial-gradient(at 20% 30%, rgba(6, 182, 212, 0.15) 0px, transparent 50%),
            radial-gradient(at 80% 70%, rgba(8, 145, 178, 0.15) 0px, transparent 50%),
            radial-gradient(at 40% 80%, rgba(14, 116, 144, 0.15) 0px, transparent 50%);
        }
      `}</style>

      {/* Header / TopBar */}
    <Header />

    <Hero />

      {/* Products Section */}  
      <ProductsSection />

      {/* Footer */}
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
};

export default MiningASICShop;
