'use client';

import { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  MessageCircle,
  Building2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function ContactPage() {
  const { settings, loading } = useSiteSettings();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // WhatsApp numarasını formatla
  const whatsappNumber = settings.contact_phone?.replace(/[^0-9]/g, '') || '905559725387';

  


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="orbitron text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            İletişime Geçin
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Sorularınız, siparişleriniz veya teknik destek için bizimle iletişime geçebilirsiniz.
            Size en kısa sürede dönüş yapacağız.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* WhatsApp CTA */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-green-400">WhatsApp ile Ulaşın</h3>
                    <p className="text-sm text-gray-400">En hızlı yanıt için</p>
                  </div>
                </div>
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=Merhaba,%20bilgi%20almak%20istiyorum.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Hemen Mesaj Gönder
                </a>
              </div>

              {/* Contact Cards */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6 space-y-6">
                <h3 className="font-bold text-lg text-cyan-400 mb-4">İletişim Bilgileri</h3>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Telefon</p>
                    <a href={`tel:${settings.contact_phone || '+902125550000'}`} className="text-gray-400 hover:text-cyan-300 transition-colors">
                      {settings.contact_phone || '+90 (212) 555 00 00'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">E-posta</p>
                    <a href={`mailto:${settings.contact_email || 'info@asicstore.com'}`} className="text-gray-400 hover:text-cyan-300 transition-colors">
                      {settings.contact_email || 'info@asicstore.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Adres</p>
                    <p className="text-gray-400">
                      {settings.contact_address || 'Maslak Mah. Büyükdere Cad. No:123'}<br />
                      {settings.contact_city || 'Sarıyer / İstanbul, Türkiye'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Çalışma Saatleri</p>
                    <p className="text-gray-400">
                      {settings.business_hours || 'Pazartesi - Cumartesi 09:00 - 18:00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Bizi Ziyaret Edin</h2>
          <div className="rounded-2xl overflow-hidden border border-cyan-500/20 h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6938.727205292989!2d29.129481641601025!3d40.92239526746529!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cac7d0f7b6e025%3A0xf2fd936737e8e86c!2sBS%20Bili%C5%9Fim!5e0!3m2!1str!2str!4v1767543937464!5m2!1str!2str"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            />

            
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Sıkça Sorulan Sorular</h2>
          
          <div className="space-y-4">
            {[
              {
                q: 'Sipariş verdikten sonra ne kadar sürede teslim edilir?',
                a: 'Stokta bulunan ürünler genellikle 1-3 iş günü içinde kargoya verilir. Yurt içi teslimatlar ortalama 2-5 iş günü sürmektedir.'
              },
              {
                q: 'Hosting hizmeti nedir?',
                a: 'Hosting hizmeti, satın aldığınız madencilik cihazlarını bizim profesyonel tesislerimizde barındırma imkanı sunar. Elektrik, soğutma, bakım ve 7/24 izleme dahildir.'
              },
              {
                q: 'Garanti süreci nasıl işliyor?',
                a: 'Tüm ürünlerimiz üretici garantisi kapsamındadır. Garanti süresi içinde oluşabilecek arızalarda ücretsiz onarım veya değişim yapılmaktadır.'
              },
              {
                q: 'Ödeme seçenekleri nelerdir?',
                a: 'Havale/EFT, kredi kartı ve kripto para ile ödeme kabul ediyoruz. Kripto para ile ödemelerde %3 indirim uygulanmaktadır.'
              }
            ].map((faq, i) => (
              <details 
                key={i} 
                className="group bg-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <span className="font-medium text-white pr-4">{faq.q}</span>
                  <span className="flex-shrink-0 text-cyan-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-400">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
    
  );
}
