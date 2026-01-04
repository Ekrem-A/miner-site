import { NextResponse } from 'next/server';
import axios from "axios";
import * as cheerio from "cheerio";
import { createClient } from '@supabase/supabase-js';

const BASE_URL = "https://www.asicminervalue.com";

// Supabase client (opsiyonel)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Memory cache
interface CachedData {
  miners: MinerProfitResult[];
  fetchedAt: Date;
}
let mainPageCache: CachedData | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 saat

export type MinerProfitResult = {
  slug: string;
  name: string;
  dailyProfitUsd: number | null;
  hashrate?: string;
  power?: string;
  algorithm?: string;
  manufacturer?: string;
  fetchedAt?: string;
};

// İsimden slug oluştur
function createSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Ürün adı benzerlik kontrolü
function isMatchingProduct(minerName: string, productName: string): boolean {
  const normalize = (s: string) => s.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/antminer/g, '')
    .replace(/bitmain/g, '')
    .replace(/volcminer/g, 'volc');
  
  const m = normalize(minerName);
  const p = normalize(productName);
  
  // Direkt eşleşme
  if (m.includes(p) || p.includes(m)) return true;
  
  // Model numarası eşleşmesi (z15, s21, t21, etc.)
  const modelRegex = /(z15|s21|s19|t21|d3|l9|l11|ks\d+)/gi;
  const minerModels = minerName.match(modelRegex) || [];
  const productModels = productName.match(modelRegex) || [];
  
  for (const mm of minerModels) {
    for (const pm of productModels) {
      if (mm.toLowerCase() === pm.toLowerCase()) {
        // Pro, XP, Hydro gibi varyantları da kontrol et
        const hasProM = /pro/i.test(minerName);
        const hasProP = /pro/i.test(productName);
        const hasXpM = /xp/i.test(minerName);
        const hasXpP = /xp/i.test(productName);
        const hasHydM = /hyd/i.test(minerName);
        const hasHydP = /hyd/i.test(productName);
        
        // Varyant uyumu kontrolü
        if (hasProM !== hasProP && (hasProM || hasProP)) continue;
        if (hasXpM !== hasXpP && (hasXpM || hasXpP)) continue;
        if (hasHydM !== hasHydP && (hasHydM || hasHydP)) continue;
        
        return true;
      }
    }
  }
  
  return false;
}

// Hardcoded profit data - güncel değerler asicminervalue.com'dan
// Bu veriler otomatik güncelleme yapılamadığında fallback olarak kullanılır
const FALLBACK_PROFIT_DATA: MinerProfitResult[] = [
  { slug: "antminer-z15-pro", name: "Bitmain Antminer Z15 Pro", dailyProfitUsd: 27.96, hashrate: "840 kh/s", power: "2780W", algorithm: "Equihash", manufacturer: "Bitmain" },
  { slug: "antminer-z15", name: "Bitmain Antminer Z15", dailyProfitUsd: 13.59, hashrate: "420 kh/s", power: "1510W", algorithm: "Equihash", manufacturer: "Bitmain" },
  { slug: "antminer-t21", name: "Bitmain Antminer T21", dailyProfitUsd: 2.50, hashrate: "190 Th/s", power: "3610W", algorithm: "SHA-256", manufacturer: "Bitmain" },
  { slug: "antminer-s21-xp-hyd-473th", name: "Bitmain Antminer S21 XP Hyd 473Th", dailyProfitUsd: 4.80, hashrate: "473 Th/s", power: "5676W", algorithm: "SHA-256", manufacturer: "Bitmain" },
  { slug: "antminer-s21-xp-hyd-395th", name: "Bitmain Antminer S21 XP Hyd 395Th", dailyProfitUsd: 4.00, hashrate: "395 Th/s", power: "5130W", algorithm: "SHA-256", manufacturer: "Bitmain" },
  { slug: "antminer-s21-xp-plus-hyd-500th", name: "Bitmain Antminer S21 XP+ Hyd 500Th", dailyProfitUsd: 6.28, hashrate: "500 Th/s", power: "5500W", algorithm: "SHA-256", manufacturer: "Bitmain" },
  { slug: "antminer-s21-xp-270th", name: "Bitmain Antminer S21 XP 270Th", dailyProfitUsd: 2.74, hashrate: "270 Th/s", power: "3645W", algorithm: "SHA-256", manufacturer: "Bitmain" },
  { slug: "antminer-s21-xp-immersion", name: "Bitmain Antminer S21 XP Immersion", dailyProfitUsd: 3.00, hashrate: "300 Th/s", power: "4050W", algorithm: "SHA-256", manufacturer: "Bitmain" },
  { slug: "antminer-s21e-xp-hyd-860th", name: "Bitmain Antminer S21e XP Hyd 860Th", dailyProfitUsd: 6.68, hashrate: "860 Th/s", power: "11180W", algorithm: "SHA-256", manufacturer: "Bitmain" },
  { slug: "antminer-s21e-xp-hyd-430th", name: "Bitmain Antminer S21e XP Hyd 430Th", dailyProfitUsd: 3.34, hashrate: "430 Th/s", power: "5590W", algorithm: "SHA-256", manufacturer: "Bitmain" },
  { slug: "antminer-s21-pro", name: "Bitmain Antminer S21 Pro", dailyProfitUsd: 2.37, hashrate: "234 Th/s", power: "3510W", algorithm: "SHA-256", manufacturer: "Bitmain" },
  { slug: "antminer-s19-k-pro", name: "Bitmain Antminer S19K Pro", dailyProfitUsd: 0.80, hashrate: "120 Th/s", power: "2760W", algorithm: "SHA-256", manufacturer: "Bitmain" },
  { slug: "antminer-s19-xp-hyd", name: "Bitmain Antminer S19 XP Hyd", dailyProfitUsd: 2.40, hashrate: "255 Th/s", power: "5304W", algorithm: "SHA-256", manufacturer: "Bitmain" },
  { slug: "antminer-s19-xp-plus-hyd", name: "Bitmain Antminer S19 XP+ Hyd 293Th", dailyProfitUsd: 2.62, hashrate: "293 Th/s", power: "5418W", algorithm: "SHA-256", manufacturer: "Bitmain" },
  { slug: "volcminer-d3", name: "VolcMiner D3", dailyProfitUsd: 11.19, hashrate: "20 Gh/s", power: "3580W", algorithm: "Scrypt", manufacturer: "VolcMiner" },
  { slug: "antminer-l9-17gh", name: "Bitmain Antminer L9 17Gh", dailyProfitUsd: 8.25, hashrate: "17 Gh/s", power: "3570W", algorithm: "Scrypt", manufacturer: "Bitmain" },
  { slug: "antminer-l11-20gh", name: "Bitmain Antminer L11 20Gh", dailyProfitUsd: 10.95, hashrate: "20 Gh/s", power: "3680W", algorithm: "Scrypt", manufacturer: "Bitmain" },
  { slug: "antminer-s23", name: "Bitmain Antminer S23", dailyProfitUsd: 3.99, hashrate: "318 Th/s", power: "3498W", algorithm: "SHA-256", manufacturer: "Bitmain" },
];

// Ana sayfadan TÜM miner'ları ve profit'lerini çek
async function fetchAllMinersFromMainPage(): Promise<MinerProfitResult[]> {
  console.log("Fetching all miners from ASICMinerValue main page...");
  
  try {
    const { data } = await axios.get(BASE_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
      },
      timeout: 30000,
    });

    const $ = cheerio.load(data);
    const miners: MinerProfitResult[] = [];
    const seenNames = new Set<string>();
    
    // Tüm text'i al ve satırlara böl
    const bodyText = $('body').text();
    
    // Miner pattern: "Manufacturer Model (hashrate) ... $XX.XX /day"
    // Regex ile her miner'ı bul
    const minerRegex = /(Bitmain|VolcMiner|IceRiver|Jasminer|Goldshell|Canaan|MicroBT|Pinecone|ElphaPex|Bitdeer)\s+([\w\s\-\+\.]+?)\s*\(\s*([\d.,]+\s*(?:Ph|Th|Gh|Mh|kh))\s*\)[^$]*?\$([\d,.]+)\s*\/\s*day/gi;
    
    let match;
    while ((match = minerRegex.exec(bodyText)) !== null) {
      const manufacturer = match[1];
      const model = match[2].trim();
      const hashrate = match[3];
      const profit = parseFloat(match[4].replace(',', ''));
      
      const fullName = `${manufacturer} ${model}`;
      const normalizedName = fullName.toLowerCase();
      
      if (!seenNames.has(normalizedName) && profit > 0 && profit < 10000) {
        seenNames.add(normalizedName);
        
        miners.push({
          slug: createSlugFromName(fullName),
          name: fullName,
          manufacturer,
          dailyProfitUsd: profit,
          hashrate: hashrate + '/s',
          fetchedAt: new Date().toISOString(),
        });
      }
    }
    
    console.log(`Parsed ${miners.length} miners from main page`);
    
    // Yeterli veri bulunamadıysa fallback kullan
    if (miners.length < 5) {
      console.log("Using fallback data due to insufficient parsed results");
      return FALLBACK_PROFIT_DATA.map(m => ({
        ...m,
        fetchedAt: new Date().toISOString(),
      }));
    }
    
    return miners;
  } catch (err) {
    console.error("Error fetching main page:", err);
    // Hata durumunda fallback kullan
    console.log("Using fallback data due to fetch error");
    return FALLBACK_PROFIT_DATA.map(m => ({
      ...m,
      fetchedAt: new Date().toISOString(),
    }));
  }
}

// Cache'den oku
function getFromCache(): MinerProfitResult[] | null {
  if (!mainPageCache) return null;
  
  const now = Date.now();
  if ((now - mainPageCache.fetchedAt.getTime()) < CACHE_DURATION) {
    return mainPageCache.miners;
  }
  
  return null;
}

// Cache'e kaydet
function saveToCache(miners: MinerProfitResult[]) {
  mainPageCache = {
    miners,
    fetchedAt: new Date(),
  };
}

// Supabase'e kaydet
async function saveToSupabase(profits: MinerProfitResult[]) {
  if (!supabase) return;
  
  for (const profit of profits) {
    if (profit.dailyProfitUsd !== null) {
      try {
        await supabase
          .from('miner_profits')
          .upsert({
            product_slug: profit.slug,
            miner_name: profit.name,
            daily_profit_usd: profit.dailyProfitUsd,
            hashrate: profit.hashrate,
            power: profit.power,
            algorithm: profit.algorithm,
            manufacturer: profit.manufacturer,
            fetched_at: new Date().toISOString(),
          }, {
            onConflict: 'product_slug'
          });
      } catch (e) {
        console.error('Supabase save error:', e);
      }
    }
  }
}

// Supabase'den oku
async function getFromSupabase(): Promise<MinerProfitResult[] | null> {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('miner_profits')
      .select('*');
    
    if (error || !data) return null;
    
    // Son 24 saat içindeki verileri kontrol et
    const oneDayAgo = new Date(Date.now() - CACHE_DURATION);
    const validData = data.filter(row => new Date(row.fetched_at) > oneDayAgo);
    
    if (validData.length === 0) return null;
    
    return validData.map(row => ({
      slug: row.product_slug,
      name: row.miner_name || row.product_slug,
      dailyProfitUsd: row.daily_profit_usd,
      hashrate: row.hashrate,
      power: row.power,
      algorithm: row.algorithm,
      manufacturer: row.manufacturer,
      fetchedAt: row.fetched_at,
    }));
  } catch {
    return null;
  }
}

// Belirli bir ürün için profit bul
function findProfitForProduct(miners: MinerProfitResult[], productName: string): MinerProfitResult | null {
  // Önce exact match dene
  for (const miner of miners) {
    if (isMatchingProduct(miner.name, productName)) {
      return miner;
    }
  }
  
  // Model numarasıyla dene
  const productModel = productName.match(/(z15|s21|s19|t21|d3|l9|l11)/i);
  if (productModel) {
    for (const miner of miners) {
      if (miner.name.toLowerCase().includes(productModel[1].toLowerCase())) {
        // Varyant kontrolü
        const hasProProduct = /pro/i.test(productName);
        const hasProMiner = /pro/i.test(miner.name);
        const hasXpProduct = /xp/i.test(productName);
        const hasXpMiner = /xp/i.test(miner.name);
        
        if (hasProProduct === hasProMiner && hasXpProduct === hasXpMiner) {
          return miner;
        }
      }
    }
  }
  
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productName = searchParams.get('model') || searchParams.get('name');
  const refresh = searchParams.get('refresh') === 'true';
  
  try {
    let miners: MinerProfitResult[] = [];
    let source = 'cache';
    
    // 1. Önce cache kontrol et
    if (!refresh) {
      const cached = getFromCache();
      if (cached && cached.length > 0) {
        miners = cached;
        source = 'memory-cache';
      }
    }
    
    // 2. Cache boşsa Supabase kontrol et
    if (miners.length === 0 && !refresh) {
      const dbData = await getFromSupabase();
      if (dbData && dbData.length > 0) {
        miners = dbData;
        source = 'database';
        saveToCache(miners);
      }
    }
    
    // 3. Hala veri yoksa ana sayfadan çek
    if (miners.length === 0 || refresh) {
      console.log('Fetching fresh data from ASICMinerValue...');
      miners = await fetchAllMinersFromMainPage();
      
      if (miners.length > 0) {
        source = 'fresh';
        saveToCache(miners);
        await saveToSupabase(miners);
      }
    }
    
    // Belirli bir ürün isteniyorsa
    if (productName) {
      const matchedMiner = findProfitForProduct(miners, productName);
      
      if (matchedMiner) {
        return NextResponse.json({
          ...matchedMiner,
          source,
          matchedFor: productName,
        });
      }
      
      return NextResponse.json({ 
        error: 'Eşleşen miner bulunamadı',
        searchedFor: productName,
        availableMiners: miners.map(m => m.name).slice(0, 20),
      }, { status: 404 });
    }
    
    // Tüm miner'lar
    return NextResponse.json({ 
      miners: miners.filter(m => m.dailyProfitUsd !== null),
      source,
      count: miners.length,
      lastUpdated: miners[0]?.fetchedAt || new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    // Hata durumunda cache'den dene
    const cached = getFromCache();
    if (cached) {
      return NextResponse.json({ 
        miners: cached, 
        source: 'cache-fallback',
        error: 'Fresh fetch failed'
      });
    }
    
    return NextResponse.json({ 
      error: 'Veri alınamadı',
      details: String(error)
    }, { status: 500 });
  }
}
