import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.asicminervalue.com";

export type MinerProfitData = {
  slug: string;
  name: string;
  dailyProfitUsd: number;
  hashrate?: string;
  power?: string;
  algorithm?: string;
  coin?: string;
  manufacturer?: string;
};

// İsimden slug oluştur
function createSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Memory cache (Vercel serverless için her instance'da ayrı)
let cachedData: { miners: MinerProfitData[], fetchedAt: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 saat

// ASICMinerValue'dan tüm miner profit verilerini çek
export async function fetchMinerProfits(): Promise<MinerProfitData[]> {
  // Cache kontrolü
  if (cachedData && (Date.now() - cachedData.fetchedAt) < CACHE_DURATION) {
    console.log("📦 Returning cached profit data");
    return cachedData.miners;
  }

  console.log("🔍 Fetching miners from ASICMinerValue...");
  
  try {
    const { data: html } = await axios.get(BASE_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 15000, // Vercel için daha kısa timeout
    });

    const $ = cheerio.load(html);
    const miners: MinerProfitData[] = [];
    const seenNames = new Set<string>();
    
    const fullText = $('body').text();
    const manufacturers = ['Bitmain', 'VolcMiner', 'IceRiver', 'Jasminer', 'Goldshell', 'Canaan', 'MicroBT', 'Pinecone', 'ElphaPex', 'Bitdeer'];
    
    // Her profit değerini bul ve geriye doğru miner adını ara
    const profitPattern = /\$\s*([\d,.]+)\s*\/\s*day/g;
    let profitMatch;
    
    while ((profitMatch = profitPattern.exec(fullText)) !== null) {
      const profit = parseFloat(profitMatch[1].replace(',', ''));
      if (isNaN(profit) || profit <= 0 || profit > 10000) continue;
      
      const start = Math.max(0, profitMatch.index - 800);
      const beforeProfit = fullText.slice(start, profitMatch.index);
      
      for (const mfr of manufacturers) {
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
            
            if (model.length < 2 || seenNames.has(normalizedName)) continue;
            seenNames.add(normalizedName);
            
            const powerMatch = beforeProfit.match(/(\d{2,5})\s*W/);
            const power = powerMatch ? powerMatch[1] + 'W' : undefined;
            
            // Algorithm
            const algorithms = ['SHA-256', 'Scrypt', 'Equihash', 'EtHash', 'RandomX', 'zkSNARK'];
            let algorithm = '';
            for (const alg of algorithms) {
              if (beforeProfit.toLowerCase().includes(alg.toLowerCase())) {
                algorithm = alg;
                break;
              }
            }
            
            // Coin
            const coinMap: Record<string, RegExp> = {
              'Bitcoin': /Bitcoin|BTC/i,
              'LTC/DOGE': /Litecoin|LTC|Dogecoin|DOGE/i,
              'Zcash': /Zcash|ZEC|Horizen/i,
              'Monero': /Monero|XMR/i,
              'ETC': /Ethereum Classic|ETC/i,
              'Aleo': /Aleo/i,
              'Kaspa': /Kaspa|KAS/i,
            };
            
            let coin = '';
            for (const [coinName, coinPat] of Object.entries(coinMap)) {
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
            });
            break;
          }
        }
      }
    }
    
    console.log(`✅ Fetched ${miners.length} miners`);
    
    // Cache'e kaydet
    cachedData = { miners, fetchedAt: Date.now() };
    
    return miners;
  } catch (err) {
    console.error("❌ Error fetching from ASICMinerValue:", err);
    // Cache varsa onu döndür
    if (cachedData) return cachedData.miners;
    return [];
  }
}

// Ürün adından model, hashrate, varyant bilgilerini çıkar
function parseProductInfo(name: string): {
  model: string;
  hashrate: number | null;
  hashrateUnit: string;
  variant: string[];
} {
  const normalized = name.toLowerCase();
  
  // Model numarasını bul (s21, t21, z15, l11, d3, vs.)
  const modelMatch = normalized.match(/([stzlxk])(\d+)([e]?)/i);
  const model = modelMatch ? `${modelMatch[1]}${modelMatch[2]}${modelMatch[3] || ''}` : '';
  
  // Hashrate değerini çıkar
  const hashrateMatch = name.match(/([\d.,]+)\s*(Ph|Th|Gh|Mh|kh)/i);
  const hashrate = hashrateMatch ? parseFloat(hashrateMatch[1].replace(',', '')) : null;
  const hashrateUnit = hashrateMatch ? hashrateMatch[2].toLowerCase() : '';
  
  // Varyantları belirle
  const variant: string[] = [];
  if (/hydro|hyd/i.test(name)) variant.push('hydro');
  if (/immersion|imm/i.test(name)) variant.push('immersion');
  if (/\bpro\b/i.test(name)) variant.push('pro');
  if (/xp\+/i.test(name)) variant.push('xp+');
  else if (/xp/i.test(name)) variant.push('xp');
  if (/\bk\s*pro\b/i.test(name)) variant.push('k-pro');
  if (/\d+u\b/i.test(name)) {
    const uMatch = name.match(/(\d+)u\b/i);
    if (uMatch) variant.push(`${uMatch[1]}u`);
  }
  
  return { model, hashrate, hashrateUnit, variant };
}

// Ürün adına göre en iyi eşleşen profit verisini bul
export function findBestProfitMatch(productName: string, profitData: MinerProfitData[]): MinerProfitData | null {
  if (!profitData || profitData.length === 0) return null;
  
  const productInfo = parseProductInfo(productName);
  
  let bestMatch: MinerProfitData | null = null;
  let bestScore = 0;
  
  for (const miner of profitData) {
    const minerInfo = parseProductInfo(miner.name);
    let score = 0;
    
    // Model eşleşmesi (zorunlu)
    if (!productInfo.model || !minerInfo.model) continue;
    if (productInfo.model.toLowerCase() !== minerInfo.model.toLowerCase()) continue;
    score += 100;
    
    // Hashrate eşleşmesi
    if (productInfo.hashrate && minerInfo.hashrate) {
      // Aynı birim ve değer
      if (productInfo.hashrateUnit === minerInfo.hashrateUnit) {
        const diff = Math.abs(productInfo.hashrate - minerInfo.hashrate);
        const tolerance = productInfo.hashrate * 0.15; // %15 tolerans
        if (diff <= tolerance) {
          score += 50 - (diff / productInfo.hashrate) * 30;
        }
      }
    }
    
    // Varyant eşleşmesi
    const productVariants = new Set(productInfo.variant);
    const minerVariants = new Set(minerInfo.variant);
    
    // Hydro/Immersion önemli
    const productHasWaterCooling = productVariants.has('hydro') || productVariants.has('immersion');
    const minerHasWaterCooling = minerVariants.has('hydro') || minerVariants.has('immersion');
    if (productHasWaterCooling !== minerHasWaterCooling) {
      score -= 50; // Soğutma tipi uyuşmazlığı ciddi
    } else if (productHasWaterCooling && minerHasWaterCooling) {
      score += 30;
    }
    
    // XP eşleşmesi
    const productHasXp = productVariants.has('xp') || productVariants.has('xp+');
    const minerHasXp = minerVariants.has('xp') || minerVariants.has('xp+');
    if (productHasXp !== minerHasXp) {
      score -= 30;
    } else if (productHasXp && minerHasXp) {
      score += 20;
    }
    
    // Pro eşleşmesi
    if (productVariants.has('pro') === minerVariants.has('pro')) {
      score += 15;
    } else {
      score -= 20;
    }
    
    // K-Pro eşleşmesi
    if (productVariants.has('k-pro') === minerVariants.has('k-pro')) {
      score += 15;
    } else if (productVariants.has('k-pro') || minerVariants.has('k-pro')) {
      score -= 25;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = miner;
    }
  }
  
  // Minimum skor kontrolü
  if (bestScore < 50) return null;
  
  return bestMatch;
}
