'use client';

import Image from 'next/image';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function Footer() {
  const { settings } = useSiteSettings();

  return (
    <div>
        <footer className="bg-slate-950 border-t border-cyan-500/20 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image 
                  src="/logo.png" 
                  alt={settings.site_name || 'Logo'} 
                  width={180} 
                  height={50}
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm">
                {settings.site_description || "Türkiye'nin en güvenilir kripto madencilik ekipmanları tedarikçisi."}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-cyan-300">Hızlı Erişim</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-cyan-300 transition-colors">Anasayfa</a></li>
                <li><a href="/products" className="hover:text-cyan-300 transition-colors">Ürünler</a></li>
                <li><a href="/mining" className="hover:text-cyan-300 transition-colors">Mining</a></li>
                <li><a href="/contact" className="hover:text-cyan-300 transition-colors">İletişim</a></li>
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
                {settings.contact_email && <li>Email: {settings.contact_email}</li>}
                {settings.contact_phone && <li>Tel: {settings.contact_phone}</li>}
                {(settings.contact_address || settings.contact_city) && (
                  <li>Adres: {settings.contact_address}{settings.contact_city && `, ${settings.contact_city}`}</li>
                )}
                {settings.business_hours && <li>Çalışma Saatleri: {settings.business_hours}</li>}
              </ul>
            </div>
          </div>

          <div className="border-t border-cyan-500/20 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} {settings.site_name || 'ASIC Store'}. Tüm hakları saklıdır.</p>
          </div>
        </div>
        </footer>
    </div>      
);
}
