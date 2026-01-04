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
  coin?: string;
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

// Ana sayfadan TÜM miner'ları ve profit'lerini çek
async function fetchAllMinersFromMainPage(): Promise<MinerProfitResult[]> {
  console.log("🔍 Fetching all miners from ASICMinerValue main page...");
  
  try {
    const { data: html } = await axios.get(BASE_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      timeout: 30000,
    });

    const $ = cheerio.load(html);
    const miners: MinerProfitResult[] = [];
    const seenNames = new Set<string>();
    
    // Tüm sayfadaki text'i al
    const fullText = $('body').text();
    
    // Tüm manufacturers
    const manufacturers = ['Bitmain', 'VolcMiner', 'IceRiver', 'Jasminer', 'Goldshell', 'Canaan', 'MicroBT', 'Pinecone', 'ElphaPex', 'Bitdeer'];
    
    // Profit pattern'lerini bul
    const profitPattern = /\$\s*([\d,.]+)\s*\/\s*day/g;
    let profitMatch;
    
    while ((profitMatch = profitPattern.exec(fullText)) !== null) {
      const profit = parseFloat(profitMatch[1].replace(',', ''));
      if (isNaN(profit) || profit <= 0 || profit > 10000) continue;
      
      // Profit'in öncesindeki 800 karaktere bak
      const start = Math.max(0, profitMatch.index - 800);
      const beforeProfit = fullText.slice(start, profitMatch.index);
      
      // Manufacturer ve model bul
      for (const mfr of manufacturers) {
        // Pattern: Manufacturer Manufacturer ModelName ( hashrate )
        // veya sadece: Manufacturer ModelName ( hashrate )
        const patterns = [
          new RegExp(`${mfr}\\s+${mfr}\\s+([\\w\\s\\-\\+\\.\\d]+?)\\s*\\(\\s*([\\d.,]+\\s*(?:Ph|Th|Gh|Mh|kh))\\s*\\)`, 'gi'),
          new RegExp(`${mfr}\\s+([\\w\\s\\-\\+\\.\\d]+?)\\s*\\(\\s*([\\d.,]+\\s*(?:Ph|Th|Gh|Mh|kh))\\s*\\)`, 'gi'),
        ];
        
        for (const pattern of patterns) {
          let lastMatch = null;
          let mfrMatch;
          pattern.lastIndex = 0;
          
          while ((mfrMatch = pattern.exec(beforeProfit)) !== null) {
            lastMatch = mfrMatch;
          }
          
          if (lastMatch) {
            const model = lastMatch[1].trim();
            const hashrate = lastMatch[2];
            const fullName = `${mfr} ${model}`;
            const normalizedName = fullName.toLowerCase().replace(/\s+/g, ' ').trim();
            
            // Sadece geçerli model adlarını kabul et (en az 2 karakter)
            if (model.length < 2) continue;
            
            if (!seenNames.has(normalizedName)) {
              seenNames.add(normalizedName);
              
              // Power bul
              const powerMatch = beforeProfit.match(/(\d{2,5})\s*W/);
              const power = powerMatch ? powerMatch[1] + 'W' : undefined;
              
              // Algorithm bul
              const algorithms = ['SHA-256', 'Scrypt', 'Equihash', 'EtHash', 'RandomX', 'zkSNARK', 'VersaHash', 'Blake3'];
              let algorithm = '';
              for (const alg of algorithms) {
                if (beforeProfit.toLowerCase().includes(alg.toLowerCase())) {
                  algorithm = alg;
                  break;
                }
              }
              
              // Coin bul
              const coinPatterns = [
                { pattern: /Bitcoin|BTC/i, coin: 'Bitcoin' },
                { pattern: /Litecoin|LTC|Dogecoin|DOGE/i, coin: 'LTC/DOGE' },
                { pattern: /Zcash|ZEC|Horizen/i, coin: 'Zcash' },
                { pattern: /Monero|XMR/i, coin: 'Monero' },
                { pattern: /Ethereum Classic|ETC/i, coin: 'ETC' },
                { pattern: /Aleo/i, coin: 'Aleo' },
                { pattern: /Kaspa|KAS/i, coin: 'Kaspa' },
                { pattern: /InitVerse/i, coin: 'InitVerse' },
              ];
              
              let coin = '';
              for (const { pattern: coinPat, coin: coinName } of coinPatterns) {
                if (coinPat.test(beforeProfit)) {
                  coin = coinName;
                  break;
                }
              }
              
              miners.push({
                slug: createSlugFromName(fullName),
                name: fullName,
                manufacturer: mfr,
                dailyProfitUsd: profit,
                hashrate: hashrate + '/s',
                power,
                algorithm,
                coin,
                fetchedAt: new Date().toISOString(),
              });
              break;
            }
          }
        }
        
        // Bir manufacturer için eşleşme bulduysa diğerlerini deneme
        if (miners.length > seenNames.size - 1) break;
      }
    }
    
    console.log(`✅ Parsed ${miners.length} miners from ASICMinerValue`);
    
    // Log ilk birkaç tanesini
    if (miners.length > 0) {
      console.log("Sample miners:", miners.slice(0, 5).map(m => `${m.name}: $${m.dailyProfitUsd}/day`));
    }
    
    return miners;
  } catch (err) {
    console.error("❌ Error fetching from ASICMinerValue:", err);
    return [];
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
            coin: profit.coin,
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
    
    // Son 1 saat içindeki verileri kontrol et
    const oneHourAgo = new Date(Date.now() - CACHE_DURATION);
    const validData = data.filter(row => new Date(row.fetched_at) > oneHourAgo);
    
    if (validData.length === 0) return null;
    
    return validData.map(row => ({
      slug: row.product_slug,
      name: row.miner_name || row.product_slug,
      dailyProfitUsd: row.daily_profit_usd,
      hashrate: row.hashrate,
      power: row.power,
      algorithm: row.algorithm,
      coin: row.coin,
      manufacturer: row.manufacturer,
      fetchedAt: row.fetched_at,
    }));
  } catch {
    return null;
  }
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
  
  // Model numarası eşleşmesi
  const modelRegex = /(z15|s21|s23|s19|t21|d3|d1|l9|l11|x9|x44|ae\d)/gi;
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

// Belirli bir ürün için profit bul - Gelişmiş eşleştirme
function findProfitForProduct(miners: MinerProfitResult[], productName: string): MinerProfitResult | null {
  const normalizedProduct = productName.toLowerCase().trim();
  
  console.log(`🔍 Searching profit for: "${productName}"`);
  
  // Ürün adından bilgileri çıkar
  const productInfo = parseProductName(normalizedProduct);
  console.log(`📋 Parsed product:`, productInfo);
  
  let bestMatch: MinerProfitResult | null = null;
  let bestScore = 0;
  
  for (const miner of miners) {
    const minerInfo = parseProductName(miner.name.toLowerCase());
    const score = calculateMatchScore(productInfo, minerInfo);
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = miner;
    }
  }
  
  if (bestMatch && bestScore >= 3) {
    console.log(`✅ Best match (score: ${bestScore}): ${bestMatch.name}`);
    return bestMatch;
  }
  
  console.log(`❌ No match found for: ${productName} (best score: ${bestScore})`);
  return null;
}

// Ürün adından model, hashrate, varyant bilgilerini çıkar
function parseProductName(name: string): {
  model: string;
  hashrate: number | null;
  hashrateUnit: string;
  isHydro: boolean;
  isPro: boolean;
  isXp: boolean;
  isPlus: boolean;
  isImmersion: boolean;
  variant: string;
  manufacturer: string;
} {
  const normalized = name.toLowerCase().replace(/[-_]/g, ' ');
  
  // Model çıkar (S21, S19, Z15, L11, T21, D3, etc.)
  const modelMatch = normalized.match(/\b(s21e?|s23|s19|z15|t21|l11|l9|d3|d1|x9|x44|ae3|ae2|ks\d+)\b/i);
  const model = modelMatch ? modelMatch[1].toLowerCase() : '';
  
  // Hashrate çıkar - farklı formatları destekle
  let hashrate: number | null = null;
  let hashrateUnit = '';
  
  // Format: 473Th, 473 Th, 473th/s, ( 473 Th )
  const hashratePatterns = [
    /(\d+(?:\.\d+)?)\s*(ph|th|gh|mh|kh)(?:\/s)?/i,
    /\(\s*(\d+(?:\.\d+)?)\s*(ph|th|gh|mh|kh)\s*\)/i,
  ];
  
  for (const pattern of hashratePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      hashrate = parseFloat(match[1]);
      hashrateUnit = match[2].toLowerCase();
      break;
    }
  }
  
  // Varyant bilgileri
  const isHydro = /\bhyd(?:ro)?\b/i.test(normalized);
  const isPro = /\bpro\b/i.test(normalized);
  const isXp = /\bxp\b/i.test(normalized);
  const isPlus = /\+|\bplus\b/i.test(normalized);
  const isImmersion = /\bimmer(?:sion)?\b/i.test(normalized);
  
  // Tam varyant string'i oluştur
  let variant = '';
  if (isXp) variant += 'xp';
  if (isPlus) variant += '+';
  if (isPro) variant += 'pro';
  if (isHydro) variant += 'hyd';
  if (isImmersion) variant += 'imm';
  
  // Manufacturer
  let manufacturer = '';
  if (/bitmain|antminer/i.test(normalized)) manufacturer = 'bitmain';
  else if (/volcminer/i.test(normalized)) manufacturer = 'volcminer';
  else if (/iceriver/i.test(normalized)) manufacturer = 'iceriver';
  else if (/jasminer/i.test(normalized)) manufacturer = 'jasminer';
  else if (/goldshell/i.test(normalized)) manufacturer = 'goldshell';
  else if (/canaan/i.test(normalized)) manufacturer = 'canaan';
  else if (/microbt/i.test(normalized)) manufacturer = 'microbt';
  else if (/bitdeer/i.test(normalized)) manufacturer = 'bitdeer';
  else if (/elphapex/i.test(normalized)) manufacturer = 'elphapex';
  else if (/pinecone/i.test(normalized)) manufacturer = 'pinecone';
  
  return {
    model,
    hashrate,
    hashrateUnit,
    isHydro,
    isPro,
    isXp,
    isPlus,
    isImmersion,
    variant,
    manufacturer,
  };
}

// İki ürün arasındaki eşleşme skorunu hesapla
function calculateMatchScore(
  product: ReturnType<typeof parseProductName>,
  miner: ReturnType<typeof parseProductName>
): number {
  let score = 0;
  
  // Model eşleşmesi (en önemli) - 5 puan
  if (product.model && miner.model) {
    // S21e ve S21 arasında kısmi eşleşme
    if (product.model === miner.model) {
      score += 5;
    } else if (product.model.replace('e', '') === miner.model.replace('e', '')) {
      // S21e vs S21 durumu
      score += 3;
    }
  }
  
  // Varyant eşleşmesi - her biri için 2 puan
  if (product.isHydro === miner.isHydro) score += 2;
  if (product.isPro === miner.isPro) score += 2;
  if (product.isXp === miner.isXp) score += 2;
  if (product.isPlus === miner.isPlus) score += 1;
  if (product.isImmersion === miner.isImmersion) score += 1;
  
  // Hashrate eşleşmesi - 3 puan
  if (product.hashrate && miner.hashrate && product.hashrateUnit === miner.hashrateUnit) {
    // Exact match
    if (product.hashrate === miner.hashrate) {
      score += 4;
    } 
    // Yakın değerler (%10 fark içinde)
    else if (Math.abs(product.hashrate - miner.hashrate) / miner.hashrate < 0.1) {
      score += 2;
    }
    // Yaklaşık eşleşme (%20 fark içinde)
    else if (Math.abs(product.hashrate - miner.hashrate) / miner.hashrate < 0.2) {
      score += 1;
    }
  }
  
  // Manufacturer eşleşmesi - 1 puan
  if (product.manufacturer && miner.manufacturer && product.manufacturer === miner.manufacturer) {
    score += 1;
  }
  
  // Varyant uyumsuzluğu varsa ceza ver
  // Hydro olan ürün, Hydro olmayan ile eşleşmemeli (ve tersi)
  if (product.isHydro !== miner.isHydro) score -= 3;
  if (product.isPro !== miner.isPro) score -= 2;
  if (product.isXp !== miner.isXp) score -= 2;
  
  return score;
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
          // ProductProfitDisplay için gerekli field'lar
          profitPerDayValue: matchedMiner.dailyProfitUsd,
          profitPerDay: `$${matchedMiner.dailyProfitUsd?.toFixed(2)}/day`,
          source,
          matchedFor: productName,
        });
      }
      
      // Eşleşme bulunamadıysa, en yakın sonuçları döndür
      return NextResponse.json({ 
        error: 'Eşleşen miner bulunamadı',
        searchedFor: productName,
        availableMiners: miners.slice(0, 10).map(m => ({
          name: m.name,
          dailyProfit: m.dailyProfitUsd
        })),
        // İlk miner'ı similar olarak döndür
        similar: miners.length > 0 ? [{
          ...miners[0],
          profitPerDayValue: miners[0].dailyProfitUsd,
        }] : []
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
