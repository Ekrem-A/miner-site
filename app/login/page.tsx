'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { validateEmail, checkRateLimit } from '@/lib/validation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isAuthenticated && data.user) {
            // Redirect to appropriate page
            const destination = data.user.isAdmin ? '/admin/dashboard' : '/account';
            window.location.href = destination;
          }
        }
      } catch (error) {
        // Ignore errors - user is not logged in
        console.log('No existing session');
      }
    };

    checkExistingSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Rate limiting check
    if (!checkRateLimit('login', 5, 300000)) { // 5 attempts per 5 minutes
      setError('Çok fazla giriş denemesi. Lütfen 5 dakika sonra tekrar deneyin.');
      return;
    }

    // Validate email
    const sanitizedEmail = formData.email.trim().toLowerCase();
    if (!validateEmail(sanitizedEmail)) {
      setError('Geçerli bir e-posta adresi girin');
      return;
    }

    // Validate password
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    setLoadingMessage('Giriş yapılıyor...');

    try {
      // API route'u kullan
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Giriş yapılırken bir hata oluştu');
      }

      if (data.success) {
        setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
        setLoadingMessage('');
        
        // Small delay to ensure cookies are set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use window.location for hard navigation to ensure cookies are read
        window.location.href = data.redirectUrl || redirectUrl;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Giriş yapılırken bir hata oluştu');
      setLoadingMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    setError('');
    setSuccess('');
    
    // Real-time validation
    if (name === 'email' && typeof newValue === 'string') {
      if (newValue.trim() && !validateEmail(newValue.trim())) {
        setEmailError('Geçerli bir e-posta adresi girin');
      } else {
        setEmailError('');
      }
    }
    
    if (name === 'password' && typeof newValue === 'string') {
      if (newValue && newValue.length < 6) {
        setPasswordError('Şifre en az 6 karakter olmalıdır');
      } else {
        setPasswordError('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[100px]"></div>
        
        {/* Animated Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center space-x-3 mb-8 group">
          <div className="w-20 h-20 relative transform group-hover:scale-110 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-cyan-500/30 flex items-center justify-center">
              <Image
                src="/bs-logo.png"
                alt="BS Bilişim Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide group-hover:text-cyan-400 transition-colors duration-300">BS BİLİŞİM</h1>
            <p className="text-sm text-cyan-400 font-semibold uppercase tracking-wider">Teknoloji Çözümleri</p>
          </div>
        </Link>

        {/* Login Card */}
        <div className="relative">
          {/* Card Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/30 via-blue-500/30 to-cyan-500/30 rounded-3xl blur-xl opacity-75"></div>
          
          <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-cyan-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-black text-white mb-3 uppercase tracking-wide bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Hoş Geldiniz
              </h2>
              <p className="text-gray-400 font-medium">Hesabınıza giriş yapın</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/50 rounded-xl text-red-400 text-sm backdrop-blur-sm font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border-2 border-green-500/50 rounded-xl text-green-400 text-sm backdrop-blur-sm font-medium">
                {success}
              </div>
            )}

            {loadingMessage && (
              <div className="mb-6 p-4 bg-cyan-500/10 border-2 border-cyan-500/50 rounded-xl text-cyan-400 text-sm backdrop-blur-sm font-medium flex items-center">
                <Loader2 size={16} className="animate-spin mr-2" />
                {loadingMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={20} className="text-cyan-400 group-focus-within:text-cyan-300 transition-colors" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 bg-gray-800/50 border-2 ${emailError ? 'border-yellow-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all backdrop-blur-sm font-medium`}
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
                {emailError && (
                  <p className="mt-2 text-xs text-yellow-400 font-medium flex items-center">
                    <span className="mr-1">⚠</span> {emailError}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={20} className="text-cyan-400 group-focus-within:text-cyan-300 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-14 py-4 bg-gray-800/50 border-2 ${passwordError ? 'border-yellow-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all backdrop-blur-sm font-medium`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-2 text-xs text-yellow-400 font-medium flex items-center">
                    <span className="mr-1">⚠</span> {passwordError}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center group">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-5 h-5 bg-gray-800 border-2 border-gray-600 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="ml-3 text-sm text-gray-300 font-medium cursor-pointer group-hover:text-cyan-400 transition-colors">
                    Beni Hatırla
                  </label>
                </div>
                <Link href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold transition-colors uppercase tracking-wide">
                  Şifremi Unuttum
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full mt-8 group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-black text-lg uppercase tracking-wider hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border-2 border-cyan-400/50">
                  {loading ? (
                    <>
                      <Loader2 size={24} className="animate-spin mr-3" />
                      Giriş Yapılıyor...
                    </>
                  ) : (
                    'GİRİŞ YAP'
                  )}
                </div>
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center pt-6 border-t border-gray-700/50">
              <p className="text-gray-400 text-sm font-medium">
                Hesabınız yok mu?{' '}
                <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors uppercase tracking-wide">
                  Kayıt Olun
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-400 hover:text-cyan-400 text-sm font-semibold transition-colors uppercase tracking-wide flex items-center justify-center group">
            <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500" size={48} /></div>}>
      <LoginForm />
    </Suspense>
  );
}