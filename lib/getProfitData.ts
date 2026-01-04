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

// Fallback veriler - Vercel'de scraping engellendiğinde kullanılır
// Bu veriler asicminervalue.com'dan alınmış güncel değerlerdir
const FALLBACK_PROFIT_DATA: MinerProfitData[] = [
  // Bitcoin SHA-256 Miners
  { slug: "bitmain-antminer-z15-pro", name: "Bitmain Antminer Z15 Pro", dailyProfitUsd: 29.12, hashrate: "840 kh/s", power: "2780W", algorithm: "Equihash", coin: "Zcash", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-z15", name: "Bitmain Antminer Z15", dailyProfitUsd: 14.27, hashrate: "420 kh/s", power: "1510W", algorithm: "Equihash", coin: "Zcash", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s23-hyd-3u", name: "Bitmain Antminer S23 Hyd 3U", dailyProfitUsd: 18.71, hashrate: "1.16 Ph/s", power: "11020W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s23-hyd-580th", name: "Bitmain Antminer S23 Hyd 580Th", dailyProfitUsd: 9.36, hashrate: "580 Th/s", power: "5510W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21e-xp-hyd-860th", name: "Bitmain Antminer S21e XP Hyd 860Th", dailyProfitUsd: 6.65, hashrate: "860 Th/s", power: "11180W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21e-xp-hyd-430th", name: "Bitmain Antminer S21e XP Hyd 430Th", dailyProfitUsd: 3.33, hashrate: "430 Th/s", power: "5590W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21-xp-hyd-500th", name: "Bitmain Antminer S21 XP+ Hyd 500Th", dailyProfitUsd: 6.27, hashrate: "500 Th/s", power: "5500W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21-xp-hyd-473th", name: "Bitmain Antminer S21 XP Hyd 473Th", dailyProfitUsd: 5.00, hashrate: "473 Th/s", power: "5676W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21-xp-hyd-395th", name: "Bitmain Antminer S21 XP Hyd 395Th", dailyProfitUsd: 4.15, hashrate: "395 Th/s", power: "5130W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21-xp-270th", name: "Bitmain Antminer S21 XP 270Th", dailyProfitUsd: 2.80, hashrate: "270 Th/s", power: "3645W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21-xp-immersion", name: "Bitmain Antminer S21 XP Immersion 300Th", dailyProfitUsd: 3.10, hashrate: "300 Th/s", power: "4050W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21-pro-234th", name: "Bitmain Antminer S21 Pro 234Th", dailyProfitUsd: 2.45, hashrate: "234 Th/s", power: "3510W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21-200th", name: "Bitmain Antminer S21 200Th", dailyProfitUsd: 2.10, hashrate: "200 Th/s", power: "3550W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-t21-190th", name: "Bitmain Antminer T21 190Th", dailyProfitUsd: 1.95, hashrate: "190 Th/s", power: "3610W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s19-xp-hyd-255th", name: "Bitmain Antminer S19 XP Hyd 255Th", dailyProfitUsd: 2.42, hashrate: "255 Th/s", power: "5304W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s19-xp-plus-hyd-293th", name: "Bitmain Antminer S19 XP+ Hyd 293Th", dailyProfitUsd: 2.62, hashrate: "293 Th/s", power: "5418W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s19-k-pro-120th", name: "Bitmain Antminer S19K Pro 120Th", dailyProfitUsd: 0.85, hashrate: "120 Th/s", power: "2760W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  // Scrypt Miners (LTC/DOGE)
  { slug: "bitmain-antminer-l11-hyd-2u-35gh", name: "Bitmain Antminer L11 Hyd 2U 35Gh", dailyProfitUsd: 13.28, hashrate: "35 Gh/s", power: "5775W", algorithm: "Scrypt", coin: "LTC/DOGE", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-l11-hyd-6u-33gh", name: "Bitmain Antminer L11 Hyd 6U 33Gh", dailyProfitUsd: 11.96, hashrate: "33 Gh/s", power: "5676W", algorithm: "Scrypt", coin: "LTC/DOGE", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-l11-pro-21gh", name: "Bitmain Antminer L11 Pro 21Gh", dailyProfitUsd: 7.61, hashrate: "21 Gh/s", power: "3612W", algorithm: "Scrypt", coin: "LTC/DOGE", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-l11-20gh", name: "Bitmain Antminer L11 20Gh", dailyProfitUsd: 6.67, hashrate: "20 Gh/s", power: "3680W", algorithm: "Scrypt", coin: "LTC/DOGE", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-l9-hyd-2u-27gh", name: "Bitmain Antminer L9 Hyd 2U 27Gh", dailyProfitUsd: 7.33, hashrate: "27 Gh/s", power: "5670W", algorithm: "Scrypt", coin: "LTC/DOGE", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-l9-17gh", name: "Bitmain Antminer L9 17Gh", dailyProfitUsd: 5.50, hashrate: "17 Gh/s", power: "3570W", algorithm: "Scrypt", coin: "LTC/DOGE", manufacturer: "Bitmain" },
  { slug: "volcminer-d3-20gh", name: "VolcMiner D3 20Gh", dailyProfitUsd: 6.91, hashrate: "20 Gh/s", power: "3580W", algorithm: "Scrypt", coin: "LTC/DOGE", manufacturer: "VolcMiner" },
  { slug: "volcminer-d1-pro-20gh", name: "VolcMiner D1 Pro 20Gh", dailyProfitUsd: 6.63, hashrate: "20 Gh/s", power: "3700W", algorithm: "Scrypt", coin: "LTC/DOGE", manufacturer: "VolcMiner" },
  { slug: "elphapex-dg2-plus-20gh", name: "ElphaPex DG2+ 20.5Gh", dailyProfitUsd: 6.53, hashrate: "20.5 Gh/s", power: "3900W", algorithm: "Scrypt", coin: "LTC/DOGE", manufacturer: "ElphaPex" },
  // Other Algorithms
  { slug: "bitmain-antminer-x9-1mh", name: "Bitmain Antminer X9 1Mh", dailyProfitUsd: 25.34, hashrate: "1 Mh/s", power: "2472W", algorithm: "RandomX", coin: "Monero", manufacturer: "Bitmain" },
  { slug: "pinecone-matches-inibox-850mh", name: "Pinecone Matches INIBOX 850Mh", dailyProfitUsd: 26.35, hashrate: "850 Mh/s", power: "500W", algorithm: "VersaHash", coin: "InitVerse", manufacturer: "Pinecone" },
  { slug: "iceriver-aleo-ae3-2gh", name: "IceRiver ALEO AE3 2Gh", dailyProfitUsd: 20.58, hashrate: "2 Gh/s", power: "3400W", algorithm: "zkSNARK", coin: "Aleo", manufacturer: "IceRiver" },
  { slug: "iceriver-aleo-ae2-720mh", name: "IceRiver ALEO AE2 720Mh", dailyProfitUsd: 7.22, hashrate: "720 Mh/s", power: "1300W", algorithm: "zkSNARK", coin: "Aleo", manufacturer: "IceRiver" },
  { slug: "jasminer-x44-p-23gh", name: "Jasminer X44-P 23.4Gh", dailyProfitUsd: 12.07, hashrate: "23.4 Gh/s", power: "2550W", algorithm: "EtHash", coin: "ETC", manufacturer: "Jasminer" },
  { slug: "bitdeer-sealminer-a3-pro-hydro-660th", name: "Bitdeer SealMiner A3 Pro Hydro 660Th", dailyProfitUsd: 5.89, hashrate: "660 Th/s", power: "8250W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitdeer" },
];

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
      timeout: 10000, // 10 saniye timeout
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
    
    // Scraping başarılı ve yeterli veri varsa
    if (miners.length >= 5) {
      console.log(`✅ Fetched ${miners.length} miners from ASICMinerValue`);
      cachedData = { miners, fetchedAt: Date.now() };
      return miners;
    }
    
    // Yeterli veri yoksa fallback kullan
    console.log(`⚠️ Only ${miners.length} miners found, using fallback data`);
    cachedData = { miners: FALLBACK_PROFIT_DATA, fetchedAt: Date.now() };
    return FALLBACK_PROFIT_DATA;
    
  } catch (err) {
    console.error("❌ Error fetching from ASICMinerValue:", err instanceof Error ? err.message : err);
    
    // Hata durumunda fallback kullan
    console.log("📋 Using fallback profit data");
    cachedData = { miners: FALLBACK_PROFIT_DATA, fetchedAt: Date.now() };
    return FALLBACK_PROFIT_DATA;
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
