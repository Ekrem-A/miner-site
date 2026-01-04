'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Settings as SettingsIcon, 
  Save, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Store,
  FileText,
  Building,
  Clock
} from 'lucide-react';

interface SiteSettings {
  id?: string;
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  contact_city: string;
  business_hours: string;
  tax_office: string;
  tax_number: string;
  mersis_number: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_linkedin?: string;
  created_at?: string;
  updated_at?: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'Han Bilişim',
    site_description: 'ASIC Miner Çözümleri',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    contact_city: '',
    business_hours: '',
    tax_office: '',
    tax_number: '',
    mersis_number: '',
    social_facebook: '',
    social_instagram: '',
    social_twitter: '',
    social_linkedin: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Supabase'den ayarları yükle
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error loading settings:', error);
        // Hata durumunda varsayılan değerleri kullan
      } else if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Supabase'e kaydet
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: settings.id,
          site_name: settings.site_name,
          site_description: settings.site_description,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          contact_address: settings.contact_address,
          contact_city: settings.contact_city,
          business_hours: settings.business_hours,
          tax_office: settings.tax_office,
          tax_number: settings.tax_number,
          mersis_number: settings.mersis_number,
          social_facebook: settings.social_facebook,
          social_instagram: settings.social_instagram,
          social_twitter: settings.social_twitter,
          social_linkedin: settings.social_linkedin,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving settings:', error);
        alert('Hata: ' + error.message);
      } else {
        alert('Ayarlar başarıyla kaydedildi!');
        // Ayarları yeniden yükle
        await loadSettings();
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert('Hata: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="text-slate-600 text-center">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Site Ayarları</h1>
        <p className="text-slate-600">Genel site bilgilerini ve iletişim detaylarını yönetin</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Genel Bilgiler */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Store size={24} className="text-cyan-600" />
            <h2 className="text-xl font-bold text-slate-800">Genel Bilgiler</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Site Adı</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Site Açıklaması</label>
              <input
                type="text"
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Mail size={24} className="text-cyan-600" />
            <h2 className="text-xl font-bold text-slate-800">İletişim Bilgileri</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
              <div className="relative">
                <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  placeholder="+90 (XXX) XXX XX XX"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Format: +90 (XXX) XXX XX XX</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Adres</label>
              <div className="relative">
                <MapPin size={20} className="absolute left-3 top-3 text-slate-400" />
                <textarea
                  rows={3}
                  value={settings.contact_address}
                  onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Şehir</label>
              <input
                type="text"
                value={settings.contact_city}
                onChange={(e) => setSettings({ ...settings, contact_city: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Çalışma Saatleri</label>
              <div className="relative">
                <Clock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={settings.business_hours}
                  onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sosyal Medya
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Globe size={24} className="text-cyan-600" />
            <h2 className="text-xl font-bold text-slate-800">Sosyal Medya</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Facebook</label>
              <input
                type="url"
                value={settings.social_facebook || ''}
                onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Instagram</label>
              <input
                type="url"
                value={settings.social_instagram || ''}
                onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Twitter / X</label>
              <input
                type="url"
                value={settings.social_twitter || ''}
                onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
                placeholder="https://twitter.com/..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn</label>
              <input
                type="url"
                value={settings.social_linkedin || ''}
                onChange={(e) => setSettings({ ...settings, social_linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div> */}

        {/* Save Button */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save size={20} />
            <span>{saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
