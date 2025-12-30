'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, User, Search, Zap } from 'lucide-react';

import Image from 'next/image';

export function Header() {

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
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-slate-950/95 backdrop-blur-lg shadow-lg shadow-cyan-500/10' : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3">
                            <div className="w-36 h-15 rounded-xl bg-gradient-to-b flex items-center justify-center glow">
                                <Image
                                src="/logo.png"
                                alt="Logo"
                                width={128}
                                height={128}
                                />
                            </div>
                        </div>
                    <div>
                        <h1 className="orbitron text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                        ASIC STORE
                        </h1>
                        <p className="text-xs text-cyan-300/70">Mining Ekipmanları</p>
                    </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                    <a href="#" className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors">Anasayfa</a>
                    <a href="#products" className="text-gray-300 hover:text-cyan-300 font-medium transition-colors">Ürünler</a>
                    <a href="#" className="text-gray-300 hover:text-cyan-300 font-medium transition-colors">Hakkımızda</a>
                    <a href="#" className="text-gray-300 hover:text-cyan-300 font-medium transition-colors">İletişim</a>
                    </nav>

                    {/* Action Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                    <button className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors">
                        <Search className="w-5 h-5 text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors">
                        <User className="w-5 h-5 text-gray-300" />
                    </button>
                    <button className="relative p-2 hover:bg-cyan-500/10 rounded-lg transition-colors">
                        <ShoppingCart className="w-5 h-5 text-gray-300" />
                        {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                            {cartCount}
                        </span>
                        )}
                    </button>
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
                <div className="md:hidden bg-slate-950/98 backdrop-blur-xl border-t border-cyan-500/20">
                    <div className="px-4 py-6 space-y-4">
                    <a href="#" className="block text-cyan-300 hover:text-cyan-200 font-medium py-2 transition-colors">Anasayfa</a>
                    <a href="#products" className="block text-gray-300 hover:text-cyan-300 font-medium py-2 transition-colors">Ürünler</a>
                    <a href="#" className="block text-gray-300 hover:text-cyan-300 font-medium py-2 transition-colors">Hakkımızda</a>
                    <a href="#" className="block text-gray-300 hover:text-cyan-300 font-medium py-2 transition-colors">İletişim</a>
                    <div className="flex items-center space-x-4 pt-4 border-t border-cyan-500/20">
                        <button className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold transition-colors">
                        Giriş Yap
                        </button>
                        <button className="p-3 hover:bg-cyan-500/10 rounded-lg transition-colors">
                        <ShoppingCart className="w-5 h-5" />
                        </button>
                    </div>
                    </div>
                </div>
                )}
            </header>
    );
  
}