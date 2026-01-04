'use client';

import { useState, useEffect } from 'react';

export interface SiteSettings {
  id?: string;
  site_name: string;
  site_description: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  contact_city: string | null;
  business_hours: string | null;
  tax_office: string | null;
  tax_number: string | null;
  mersis_number: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_linkedin: string | null;
}

const defaultSettings: SiteSettings = {
  site_name: 'Han Bilişim',
  site_description: 'ASIC Miner Çözümleri',
  contact_email: null,
  contact_phone: null,
  contact_address: null,
  contact_city: null,
  business_hours: null,
  tax_office: null,
  tax_number: null,
  mersis_number: null,
  social_facebook: null,
  social_instagram: null,
  social_twitter: null,
  social_linkedin: null,
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/site-settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Site settings fetch error:', err);
        setError('Site ayarları yüklenemedi');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
