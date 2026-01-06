'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import Image from 'next/image';

export function Header() {
    const { settings } = useSiteSettings();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    // WhatsApp numarasını formatla
    const whatsappNumber = settings.contact_phone?.replace(/[^0-9]/g, '') || '905559725387';

    useEffect(() => {
        const handleScroll = () => {
        setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3">
                            <div className="w-36 h-15 rounded-xl bg-gradient-to-b flex items-center justify-center">
                                <Image
                                src="/logo.png"
                                alt="Logo"
                                width={128}
                                height={128}
                                />
                            </div>
                        </div>
                    <div>
                        <h1 className="orbitron text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                        {settings.site_name || 'ASIC STORE'}
                        </h1>
                        <p className="text-xs text-gray-500">{settings.site_description || 'Mining Ekipmanları'}</p>
                    </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                    <a href="/" className="text-cyan-600 hover:text-cyan-500 font-medium transition-colors">Anasayfa</a>
                    <a href="/products" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors">Ürünler</a>
                    <a href="/mining" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors">Mining</a>
                    <a href="/contact" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors">İletişim</a>
                    </nav>

                    {/* Action Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Search className="w-5 h-5 text-gray-600" />
                    </button>
                    <a 
                        href={`https://wa.me/${whatsappNumber}?text=Merhaba,%20bilgi%20almak%20istiyorum.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        İletişime Geç
                    </a>
                    </div>

                    {/* Mobile Menu Button */}
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
                    >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                <div className="md:hidden bg-white/98 backdrop-blur-xl border-t border-gray-200">
                    <div className="px-4 py-6 space-y-4">
                    <a href="/" className="block text-cyan-600 hover:text-cyan-500 font-medium py-2 transition-colors">Anasayfa</a>
                    <a href="/products" className="block text-gray-600 hover:text-cyan-600 font-medium py-2 transition-colors">Ürünler</a>
                    <a href="/mining" className="block text-gray-600 hover:text-cyan-600 font-medium py-2 transition-colors">Mining</a>
                    <a href="/contact" className="block text-gray-600 hover:text-cyan-600 font-medium py-2 transition-colors">İletişim</a>
                    <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                        <a 
                            href={`https://wa.me/${whatsappNumber}?text=Merhaba,%20bilgi%20almak%20istiyorum.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            WhatsApp ile İletişime Geç
                        </a>
                    </div>
                    </div>
                </div>
                )}
            </header>
    );
  
}