'use client';

import { useState, useEffect } from 'react';
import { Zap, DollarSign, TrendingUp, RefreshCw, Phone } from 'lucide-react';

// Ürün bazlı hardcoded teknik özellikler
const PRODUCT_SPECS: Record<string, Record<string, string>> = {
  // Antminer S21 Pro 234 TH
  "Antminer S21 Pro 234 TH": {
    "Hashrate": "234 TH/s",
    "Güç Tüketimi": "3510W ±5%",
    "Enerji Verimliliği": "15.0 J/TH",
    "Algoritma": "SHA-256",
    "Coin": "Bitcoin (BTC)",
    "Soğutma": "Hava Soğutma (4 Fan)",
    "Gürültü Seviyesi": "75 dB",
    "Boyutlar": "400 x 195 x 290 mm",
    "Ağırlık": "14.6 kg",
    "Çalışma Sıcaklığı": "5°C ~ 45°C",
    "Ağ Bağlantısı": "Ethernet",
    "Güç Girişi": "12V DC, 6-pin konnektör",
  },
  // Antminer S21 XP 270 TH
  "Antminer S21 XP 270 TH": {
    "Hashrate": "270 TH/s",
    "Güç Tüketimi": "3645W ±5%",
    "Enerji Verimliliği": "13.5 J/TH",
    "Algoritma": "SHA-256",
    "Coin": "Bitcoin (BTC)",
    "Soğutma": "Hava Soğutma (4 Fan)",
    "Gürültü Seviyesi": "75 dB",
    "Boyutlar": "400 x 195 x 290 mm",
    "Ağırlık": "15.2 kg",
    "Çalışma Sıcaklığı": "5°C ~ 45°C",
    "Ağ Bağlantısı": "Ethernet",
    "Güç Girişi": "12V DC, 6-pin konnektör",
  },
  // Antminer S21 XP Hydro 395 TH
  "Antminer S21 XP Hydro 395 TH": {
    "Hashrate": "395 TH/s",
    "Güç Tüketimi": "5130W ±5%",
    "Enerji Verimliliği": "13.0 J/TH",
    "Algoritma": "SHA-256",
    "Coin": "Bitcoin (BTC)",
    "Soğutma": "Su Soğutma (Hydro)",
    "Su Giriş Sıcaklığı": "≤35°C",
    "Su Debisi": "≥4 L/min",
    "Boyutlar": "410 x 170 x 209 mm",
    "Ağırlık": "12.5 kg",
    "Çalışma Sıcaklığı": "5°C ~ 45°C",
    "Ağ Bağlantısı": "Ethernet",
    "Güç Girişi": "12V DC, 6-pin konnektör",
  },
  // Antminer S21 XP Hydro 473 TH
  "Antminer S21 XP Hydro 473 TH": {
    "Hashrate": "473 TH/s",
    "Güç Tüketimi": "5676W ±5%",
    "Enerji Verimliliği": "12.0 J/TH",
    "Algoritma": "SHA-256",
    "Coin": "Bitcoin (BTC)",
    "Soğutma": "Su Soğutma (Hydro)",
    "Su Giriş Sıcaklığı": "≤35°C",
    "Su Debisi": "≥5 L/min",
    "Boyutlar": "410 x 170 x 209 mm",
    "Ağırlık": "13.0 kg",
    "Çalışma Sıcaklığı": "5°C ~ 45°C",
    "Ağ Bağlantısı": "Ethernet",
    "Güç Girişi": "12V DC, 6-pin konnektör",
  },
  // Antminer S21 XP Immersion 300 TH
  "Antminer S21 XP Immersion 300 TH": {
    "Hashrate": "300 TH/s",
    "Güç Tüketimi": "4050W ±5%",
    "Enerji Verimliliği": "13.5 J/TH",
    "Algoritma": "SHA-256",
    "Coin": "Bitcoin (BTC)",
    "Soğutma": "Daldırmalı Soğutma (Immersion)",
    "Soğutucu Sıvı": "Dielektrik Yağ",
    "Boyutlar": "400 x 195 x 290 mm",
    "Ağırlık": "11.8 kg",
    "Çalışma Sıcaklığı": "5°C ~ 45°C",
    "Ağ Bağlantısı": "Ethernet",
    "Güç Girişi": "12V DC, 6-pin konnektör",
  },
  // Antminer S21 E EXP 860 TH
  "Antminer S21 E EXP 860 TH": {
    "Hashrate": "860 TH/s",
    "Güç Tüketimi": "11180W ±5%",
    "Enerji Verimliliği": "13.0 J/TH",
    "Algoritma": "SHA-256",
    "Coin": "Bitcoin (BTC)",
    "Soğutma": "Su Soğutma (Hydro)",
    "Konfigürasyon": "Çift Güç Kaynağı",
    "Boyutlar": "570 x 316 x 430 mm",
    "Ağırlık": "28 kg",
    "Çalışma Sıcaklığı": "5°C ~ 45°C",
    "Ağ Bağlantısı": "Ethernet",
    "Güç Girişi": "2x 12V DC",
  },
  // Antminer T21 190 TH
  "Antminer T21 190 TH": {
    "Hashrate": "190 TH/s",
    "Güç Tüketimi": "3610W ±5%",
    "Enerji Verimliliği": "19.0 J/TH",
    "Algoritma": "SHA-256",
    "Coin": "Bitcoin (BTC)",
    "Soğutma": "Hava Soğutma (4 Fan)",
    "Gürültü Seviyesi": "75 dB",
    "Boyutlar": "400 x 195 x 290 mm",
    "Ağırlık": "14.2 kg",
    "Çalışma Sıcaklığı": "5°C ~ 45°C",
    "Ağ Bağlantısı": "Ethernet",
    "Güç Girişi": "12V DC, 6-pin konnektör",
  },
  // Antminer S19 K Pro
  "Antminer S19 K Pro": {
    "Hashrate": "120 TH/s",
    "Güç Tüketimi": "2760W ±5%",
    "Enerji Verimliliği": "23.0 J/TH",
    "Algoritma": "SHA-256",
    "Coin": "Bitcoin (BTC)",
    "Soğutma": "Hava Soğutma (4 Fan)",
    "Gürültü Seviyesi": "75 dB",
    "Boyutlar": "400 x 195 x 290 mm",
    "Ağırlık": "13.5 kg",
    "Çalışma Sıcaklığı": "5°C ~ 40°C",
    "Ağ Bağlantısı": "Ethernet",
    "Güç Girişi": "12V DC, 6-pin konnektör",
  },
  // Antminer S19 XP+ Hydro 293 TH
  "Antminer S19 XP+ Hydro 293 TH": {
    "Hashrate": "293 TH/s",
    "Güç Tüketimi": "5418W ±5%",
    "Enerji Verimliliği": "18.5 J/TH",
    "Algoritma": "SHA-256",
    "Coin": "Bitcoin (BTC)",
    "Soğutma": "Su Soğutma (Hydro)",
    "Su Giriş Sıcaklığı": "≤35°C",
    "Su Debisi": "≥4 L/min",
    "Boyutlar": "410 x 170 x 209 mm",
    "Ağırlık": "12.0 kg",
    "Çalışma Sıcaklığı": "5°C ~ 40°C",
    "Ağ Bağlantısı": "Ethernet",
    "Güç Girişi": "12V DC, 6-pin konnektör",
  },
  // Bitmain Antminer Z15 Pro 840 KH/s
  "Bitmain Antminer Z15 Pro 840 KH/s": {
    "Hashrate": "840 KSol/s",
    "Güç Tüketimi": "2780W ±5%",
    "Enerji Verimliliği": "3.3 J/KSol",
    "Algoritma": "Equihash",
    "Coin": "Zcash (ZEC)",
    "Soğutma": "Hava Soğutma (4 Fan)",
    "Gürültü Seviyesi": "75 dB",
    "Boyutlar": "400 x 195 x 290 mm",
    "Ağırlık": "14.0 kg",
    "Çalışma Sıcaklığı": "5°C ~ 40°C",
    "Ağ Bağlantısı": "Ethernet",
    "Güç Girişi": "12V DC, 6-pin konnektör",
  },
  // VolcMiner D3 20GH/s Scrypt Miner
  "VolcMiner D3 20GH/s Scrypt Miner": {
    "Hashrate": "20 GH/s",
    "Güç Tüketimi": "3580W ±5%",
    "Enerji Verimliliği": "179 J/GH",
    "Algoritma": "Scrypt",
    "Coin": "Litecoin (LTC) / Dogecoin (DOGE)",
    "Soğutma": "Hava Soğutma (4 Fan)",
    "Gürültü Seviyesi": "75 dB",
    "Boyutlar": "430 x 195 x 290 mm",
    "Ağırlık": "15.5 kg",
    "Çalışma Sıcaklığı": "5°C ~ 40°C",
    "Ağ Bağlantısı": "Ethernet",
    "Güç Girişi": "12V DC, 6-pin konnektör",
  },
};

// Ürün adına göre specs al
function getProductSpecs(productName: string): Record<string, string> | null {
  // Birebir eşleşme
  if (PRODUCT_SPECS[productName]) {
    return PRODUCT_SPECS[productName];
  }
  
  // Kısmi eşleşme dene
  const normalizedName = productName.toLowerCase();
  for (const [key, specs] of Object.entries(PRODUCT_SPECS)) {
    if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
      return specs;
    }
  }
  
  return null;
}

interface ProductTabsProps {
  product: {
    name: string;
    brand: string;
    description?: string;
    specs?: Record<string, any>;
    tags?: string[];
    algorithm?: string;
    coin?: string;
    hashrate?: number;
    hashrate_unit?: string;
    power_consumption?: number;
  };
}

interface CoinData {
  id: number;
  tag: string;
  name: string;
  algorithm: string;
  nethash: number;
  block_reward: number;
  block_reward24: number;
  block_time: string;
  difficulty: number;
  difficulty24: number;
  exchange_rate: number; // BTC cinsinden fiyat
  exchange_rate24: number;
  estimated_rewards: string; // Tahmini günlük coin ödülü
  estimated_rewards24: string;
  btc_revenue: string; // Günlük BTC geliri
  btc_revenue24: string;
  profitability: number;
  profitability24: number;
}

type TabType = 'description' | 'specs';

// Spec değerini string'e çevir
function formatSpecValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'object') {
    if ('value' in value && 'unit' in value) {
      return `${value.value} ${value.unit}`;
    }
    if ('value' in value) {
      return String(value.value);
    }
    return JSON.stringify(value);
  }
  return String(value);
}

// Hashrate'i normalize et (her şeyi H/s'ye çevir)
function normalizeHashrate(hashrate: number, unit: string): number {
  const multipliers: Record<string, number> = {
    'H/s': 1,
    'KH/s': 1e3,
    'MH/s': 1e6,
    'GH/s': 1e9,
    'TH/s': 1e12,
    'PH/s': 1e15,
    'EH/s': 1e18,
  };
  return hashrate * (multipliers[unit] || 1);
}

// WhatToMine'ın her algoritma için kullandığı varsayılan referans hashrate'ler
// Bu değerler WhatToMine'ın btc_revenue hesaplamasında kullandığı hashrate'ler
const REFERENCE_HASHRATES: Record<string, { value: number; unit: string }> = {
  'SHA-256': { value: 1, unit: 'TH/s' },
  'Scrypt': { value: 1, unit: 'MH/s' },
  'Equihash': { value: 140, unit: 'KH/s' },  // 140 ksol/s
  'Ethash': { value: 1, unit: 'MH/s' },
  'X11': { value: 1, unit: 'MH/s' },
  'Blake2b': { value: 1, unit: 'GH/s' },
  'Blake2s': { value: 1, unit: 'GH/s' },
  'CryptoNight': { value: 1, unit: 'KH/s' },
  'Eaglesong': { value: 1, unit: 'TH/s' },
  'Handshake': { value: 1, unit: 'TH/s' },
  'Kadena': { value: 1, unit: 'TH/s' },
  'Kheavyhash': { value: 1, unit: 'TH/s' },
  'RandomX': { value: 1, unit: 'KH/s' },
  'ZHash': { value: 140, unit: 'KH/s' },
};

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [electricityCost, setElectricityCost] = useState<string>('0.08');
  const [currency, setCurrency] = useState<'USD' | 'TRY'>('USD');
  const [coinData, setCoinData] = useState<CoinData | null>(null);
  const [allCoins, setAllCoins] = useState<CoinData[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<string>('BTC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [btcPrice, setBtcPrice] = useState<number>(97000); // Varsayılan BTC fiyatı
  
  // Döviz kuru (yaklaşık)
  const USD_TO_TRY = 35.5;

  // Specs'den mining değerlerini çıkar
  const getMiningSpecs = () => {
    const specs = product.specs || {};
    
    // Hashrate'i bul (Hashrate, Hash Rate, Hash rate gibi key'leri ara)
    let hashrate = product.hashrate;
    let hashrateUnit = product.hashrate_unit || 'TH/s';
    
    if (!hashrate) {
      for (const key of Object.keys(specs)) {
        if (key.toLowerCase().includes('hashrate') || key.toLowerCase().includes('hash rate')) {
          const val = specs[key];
          const strVal = typeof val === 'object' && val.value ? `${val.value} ${val.unit || ''}` : String(val);
          const match = strVal.match(/([\d.]+)\s*(H\/s|KH\/s|MH\/s|GH\/s|TH\/s|PH\/s|EH\/s)/i);
          if (match) {
            hashrate = parseFloat(match[1]);
            hashrateUnit = match[2];
          }
          break;
        }
      }
    }
    
    // Power consumption'ı bul
    let power = product.power_consumption;
    if (!power) {
      for (const key of Object.keys(specs)) {
        if (key.toLowerCase().includes('power') || key.toLowerCase().includes('güç') || key.toLowerCase().includes('watt')) {
          const val = specs[key];
          const strVal = typeof val === 'object' && val.value ? String(val.value) : String(val);
          const match = strVal.match(/([\d.]+)\s*W?/i);
          if (match) {
            power = parseFloat(match[1]);
          }
          break;
        }
      }
    }
    
    // Algorithm'ı bul
    let algorithm = product.algorithm;
    if (!algorithm) {
      for (const key of Object.keys(specs)) {
        if (key.toLowerCase().includes('algorithm') || key.toLowerCase().includes('algoritma')) {
          const val = specs[key];
          algorithm = typeof val === 'object' && val.value ? String(val.value) : String(val);
          break;
        }
      }
    }
    
    return {
      hashrate: hashrate || 100,
      hashrateUnit: hashrateUnit || 'TH/s',
      power: power || 3000,
      algorithm: algorithm || 'SHA-256',
      coin: product.coin || 'BTC'
    };
  };

  const miningSpecs = getMiningSpecs();

  const tabs = [
    { id: 'description' as TabType, label: 'Açıklama' },
    { id: 'specs' as TabType, label: 'Teknik Özellikler' },
  ];

  // API'den coin verilerini çek
  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/coins');
        if (!response.ok) throw new Error('API hatası');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setAllCoins(data);
          
          // BTC fiyatını al
          const btc = data.find((c: CoinData) => c.tag === 'BTC');
          if (btc && btc.exchange_rate) {
            setBtcPrice(btc.exchange_rate);
          }
          
          // Ürüne uygun coin'i bul veya varsayılan olarak BTC kullan
          const productCoin = miningSpecs.coin || 'BTC';
          const matchedCoin = data.find((c: CoinData) => 
            c.tag?.toLowerCase() === productCoin.toLowerCase()
          );
          
          if (matchedCoin) {
            setCoinData(matchedCoin);
            setSelectedCoin(matchedCoin.tag);
          } else if (data.length > 0) {
            // Algorithm'a göre eşleştir
            const algorithmMatch = data.find((c: CoinData) => 
              c.algorithm?.toLowerCase() === miningSpecs.algorithm.toLowerCase()
            );
            if (algorithmMatch) {
              setCoinData(algorithmMatch);
              setSelectedCoin(algorithmMatch.tag);
            } else {
              // BTC'yi varsayılan olarak kullan
              const btcCoin = data.find((c: CoinData) => c.tag === 'BTC');
              if (btcCoin) {
                setCoinData(btcCoin);
                setSelectedCoin('BTC');
              } else {
                setCoinData(data[0]);
                setSelectedCoin(data[0].tag);
              }
            }
          }
        }
      } catch (err) {
        setError('Coin verileri yüklenemedi');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  }, [activeTab, miningSpecs.coin, miningSpecs.algorithm]);

  // Coin seçildiğinde güncelle
  const handleCoinChange = (tag: string) => {
    setSelectedCoin(tag);
    const coin = allCoins.find(c => c.tag === tag);
    if (coin) setCoinData(coin);
  };

  // Kazanç hesaplama - WhatToMine btc_revenue değerini kullanarak
  const calculateEarnings = () => {
    const emptyResult = { 
      income: { daily: 0, monthly: 0, yearly: 0 }, 
      electricity: { daily: 0, monthly: 0, yearly: 0 }, 
      profit: { daily: 0, monthly: 0, yearly: 0 },
      dailyCoins: 0,
      coinTag: ''
    };
    
    if (!coinData) return emptyResult;

    // Mining specs'den değerleri al
    const hashrateValue = miningSpecs.hashrate;
    const hashrateUnit = miningSpecs.hashrateUnit;
    const powerWatts = miningSpecs.power;

    // Kullanıcının hashrate'ini normalize et (H/s'ye çevir)
    const userHashrateHps = normalizeHashrate(hashrateValue, hashrateUnit);

    // WhatToMine'ın bu algoritma için kullandığı referans hashrate'i bul
    const algorithm = coinData.algorithm || miningSpecs.algorithm;
    const refHashrate = REFERENCE_HASHRATES[algorithm] || { value: 1, unit: 'TH/s' };
    const refHashrateHps = normalizeHashrate(refHashrate.value, refHashrate.unit);

    // Kullanıcının hashrate'i / Referans hashrate = Oran
    const hashrateRatio = refHashrateHps > 0 ? userHashrateHps / refHashrateHps : 0;

    // WhatToMine'ın btc_revenue değerini kullan (referans hashrate için hesaplanmış günlük BTC geliri)
    const btcRevenuePerDay = parseFloat(coinData.btc_revenue || '0');
    
    // Kullanıcının günlük BTC geliri = btc_revenue × oran
    const userDailyBtcRevenue = btcRevenuePerDay * hashrateRatio;

    // Günlük USD geliri
    const dailyIncomeUSD = userDailyBtcRevenue * btcPrice;

    // Günlük kazanılan coin miktarı (estimated_rewards değerini oranla)
    const estimatedRewards = parseFloat(coinData.estimated_rewards || '0');
    const dailyCoins = estimatedRewards * hashrateRatio;

    // Elektrik maliyeti (günlük)
    const dailyPowerKWh = (powerWatts * 24) / 1000;
    const elecCost = parseFloat(electricityCost) || 0;
    const dailyElectricityCostUSD = dailyPowerKWh * elecCost;

    // Net kar
    const dailyProfit = dailyIncomeUSD - dailyElectricityCostUSD;

    const multiplier = currency === 'TRY' ? USD_TO_TRY : 1;

    return {
      income: {
        daily: dailyIncomeUSD * multiplier,
        monthly: dailyIncomeUSD * 30 * multiplier,
        yearly: dailyIncomeUSD * 365 * multiplier,
      },
      electricity: {
        daily: dailyElectricityCostUSD * multiplier,
        monthly: dailyElectricityCostUSD * 30 * multiplier,
        yearly: dailyElectricityCostUSD * 365 * multiplier,
      },
      profit: {
        daily: dailyProfit * multiplier,
        monthly: dailyProfit * 30 * multiplier,
        yearly: dailyProfit * 365 * multiplier,
      },
      dailyCoins,
      coinTag: coinData.tag
    };
  };

  const earnings = calculateEarnings();
  const currencySymbol = currency === 'USD' ? '$' : '₺';

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return `${currencySymbol}${value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${currencySymbol}${value.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex justify-center gap-8 px-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 text-lg font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-amber-600 text-amber-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {product.brand} {product.name} Hakkında
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {product.description || `${product.brand} ${product.name}, kripto madenciliği dünyasında yeni standartlar belirliyor. 
              Üstün performansı ve enerji verimliliği ile sınıfının en karlı ASIC madencilik cihazlarından biri olan bu ürün,
              madencilik yatırımlarınız için ideal bir seçimdir.`}
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Yüksek hashrate kapasitesi ve optimize edilmiş güç tüketimi sayesinde, 
              maksimum verimlilik ve karlılık elde edebilirsiniz. Profesyonel madencilik operasyonları için 
              tasarlanan bu cihaz, güvenilir ve uzun ömürlü performans sunar.
            </p>
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Özellikler:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Specs Tab */}
        {activeTab === 'specs' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Teknik Özellikler</h2>
            {(() => {
              // Önce hardcoded specs'e bak
              const hardcodedSpecs = getProductSpecs(product.name);
              const specsToShow = hardcodedSpecs || (product.specs && Object.keys(product.specs).length > 0 ? product.specs : null);
              
              if (specsToShow) {
                return (
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(specsToShow).map(([key, value], idx) => (
                      <div 
                        key={idx}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <span className="text-gray-600 font-medium">{key}</span>
                        <span className="text-gray-900 font-semibold">{formatSpecValue(value)}</span>
                      </div>
                    ))}
                  </div>
                );
              }
              
              // Fallback: Sadece marka ve model göster
              return (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-600 font-medium">Marka</span>
                    <span className="text-gray-900 font-semibold">{product.brand}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-600 font-medium">Model</span>
                    <span className="text-gray-900 font-semibold">{product.name}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}