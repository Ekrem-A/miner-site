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
// İsimler senin Supabase'deki ürün isimleriyle BİREBİR eşleşiyor
const FALLBACK_PROFIT_DATA: MinerProfitData[] = [
  { slug: "bitmain-antminer-z15-pro-840-kh-s", name: "Bitmain Antminer Z15 Pro 840 KH/s", dailyProfitUsd: 29.12, hashrate: "840 kh/s", power: "2780W", algorithm: "Equihash", coin: "Zcash", manufacturer: "Bitmain" },
  { slug: "antminer-t21-190-th", name: "Antminer T21 190 TH", dailyProfitUsd: 1.95, hashrate: "190 Th/s", power: "3610W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s21-xp-hydro-395-th", name: "Antminer S21 XP Hydro 395 TH", dailyProfitUsd: 4.15, hashrate: "395 Th/s", power: "5130W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s21-xp-immersion-300-th", name: "Antminer S21 XP Immersion 300 TH", dailyProfitUsd: 3.10, hashrate: "300 Th/s", power: "4050W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s21-xp-hydro-473-th", name: "Antminer S21 XP Hydro 473 TH", dailyProfitUsd: 5.00, hashrate: "473 Th/s", power: "5676W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s21-e-exp-860-th", name: "Antminer S21 E EXP 860 TH", dailyProfitUsd: 6.65, hashrate: "860 Th/s", power: "11180W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "volcminer-d3-20gh-s-scrypt-miner", name: "VolcMiner D3 20GH/s Scrypt Miner", dailyProfitUsd: 6.91, hashrate: "20 Gh/s", power: "3580W", algorithm: "Scrypt", coin: "LTC/DOGE", manufacturer: "VolcMiner" },
  { slug: "antminer-s19-xp-hydro-293-th", name: "Antminer S19 XP+ Hydro 293 TH", dailyProfitUsd: 2.62, hashrate: "293 Th/s", power: "5418W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s21-pro-234-th", name: "Antminer S21 Pro 234 TH", dailyProfitUsd: 2.45, hashrate: "234 Th/s", power: "3510W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s19-k-pro", name: "Antminer S19 K Pro", dailyProfitUsd: 0.85, hashrate: "120 Th/s", power: "2760W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s21-xp-270-th", name: "Antminer S21 XP 270 TH", dailyProfitUsd: 2.80, hashrate: "270 Th/s", power: "3645W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  // Bitmain prefix ile de ekleyelim (bazı ürünler "Bitmain" ile başlıyor)
  { slug: "bitmain-antminer-t21-190-th", name: "Bitmain Antminer T21 190 TH", dailyProfitUsd: 1.95, hashrate: "190 Th/s", power: "3610W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21-xp-hydro-395-th", name: "Bitmain Antminer S21 XP Hydro 395 TH", dailyProfitUsd: 4.15, hashrate: "395 Th/s", power: "5130W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21-xp-immersion-300-th", name: "Bitmain Antminer S21 XP Immersion 300 TH", dailyProfitUsd: 3.10, hashrate: "300 Th/s", power: "4050W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21-xp-hydro-473-th", name: "Bitmain Antminer S21 XP Hydro 473 TH", dailyProfitUsd: 5.00, hashrate: "473 Th/s", power: "5676W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21-e-exp-860-th", name: "Bitmain Antminer S21 E EXP 860 TH", dailyProfitUsd: 6.65, hashrate: "860 Th/s", power: "11180W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s19-xp-hydro-293-th", name: "Bitmain Antminer S19 XP+ Hydro 293 TH", dailyProfitUsd: 2.62, hashrate: "293 Th/s", power: "5418W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21-pro-234-th", name: "Bitmain Antminer S21 Pro 234 TH", dailyProfitUsd: 2.45, hashrate: "234 Th/s", power: "3510W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s19-k-pro", name: "Bitmain Antminer S19 K Pro", dailyProfitUsd: 0.85, hashrate: "120 Th/s", power: "2760W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "bitmain-antminer-s21-xp-270-th", name: "Bitmain Antminer S21 XP 270 TH", dailyProfitUsd: 2.80, hashrate: "270 Th/s", power: "3645W", algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
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

// Supabase'den profit verilerini çek
async function fetchFromSupabase(): Promise<MinerProfitData[] | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log("🔍 Supabase check - URL:", supabaseUrl ? "✓ VAR" : "✗ YOK");
    console.log("🔍 Supabase check - KEY:", supabaseKey ? "✓ VAR" : "✗ YOK");
    
    if (!supabaseUrl || !supabaseKey) {
      console.log("❌ Supabase credentials missing!");
      return null;
    }
    
    const response = await fetch(`${supabaseUrl}/rest/v1/miner_profits?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      cache: 'no-store', // Her zaman taze veri çek
    });
    
    console.log("📡 Supabase response status:", response.status);
    
    if (!response.ok) {
      console.log("❌ Supabase response not OK:", response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log("📦 Supabase data count:", data?.length || 0);
    
    if (data && data.length > 0) {
      console.log(`✅ Supabase'den ${data.length} miner çekildi`);
      // İlk 3 veriyi log'la
      data.slice(0, 3).forEach((row: any) => {
        console.log(`   - ${row.name}: $${row.daily_profit_usd}`);
      });
      
      return data.map((row: any) => ({
        slug: row.slug,
        name: row.name,
        dailyProfitUsd: row.daily_profit_usd,
        hashrate: row.hashrate,
        power: row.power_watts ? `${row.power_watts}W` : undefined,
        algorithm: row.algorithm,
        coin: row.coin,
        manufacturer: row.manufacturer,
      }));
    }
    
    console.log("⚠️ Supabase'de veri yok!");
    return null;
  } catch (err) {
    console.error("Supabase fetch error:", err);
    return null;
  }
}

// ASICMinerValue'dan tüm miner profit verilerini çek
export async function fetchMinerProfits(): Promise<MinerProfitData[]> {
  // Cache kontrolü
  if (cachedData && (Date.now() - cachedData.fetchedAt) < CACHE_DURATION) {
    console.log("📦 Returning cached profit data");
    return cachedData.miners;
  }

  // 1. Önce Supabase'den dene (GitHub Actions ile güncellenen veriler)
  const supabaseData = await fetchFromSupabase();
  if (supabaseData && supabaseData.length >= 5) {
    cachedData = { miners: supabaseData, fetchedAt: Date.now() };
    return supabaseData;
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

// Ürün adına göre en iyi eşleşen profit verisini bul
// Direkt ürün adı eşleştirme - senin 11 ürünün için optimize edildi
export function findBestProfitMatch(productName: string, profitData: MinerProfitData[]): MinerProfitData | null {
  if (!profitData || profitData.length === 0) return null;
  
  // Ürün adını normalize et (küçük harf, fazla boşlukları sil)
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const normalizedProduct = normalize(productName);
  
  // Tüm veri kaynaklarını birleştir (önce profitData, sonra FALLBACK)
  const allProfitData = [...profitData, ...FALLBACK_PROFIT_DATA];
  
  // 1. Birebir isim eşleşmesi
  for (const miner of allProfitData) {
    if (normalize(miner.name) === normalizedProduct) {
      console.log(`✅ Exact match: ${productName} -> ${miner.name} ($${miner.dailyProfitUsd})`);
      return miner;
    }
  }
  
  // 2. "Bitmain" prefix'i olmadan eşleşme
  const withoutBitmain = normalizedProduct.replace(/^bitmain\s+/i, '');
  for (const miner of allProfitData) {
    const minerWithoutBitmain = normalize(miner.name).replace(/^bitmain\s+/i, '');
    if (minerWithoutBitmain === withoutBitmain) {
      console.log(`✅ Bitmain-stripped match: ${productName} -> ${miner.name} ($${miner.dailyProfitUsd})`);
      return miner;
    }
  }
  
  // 3. Anahtar model bilgilerini çıkart ve karşılaştır
  const extractKey = (name: string): string => {
    const n = name.toLowerCase();
    
    // Model: s21, t21, z15, s19, d3, vb.
    const modelMatch = n.match(/([stzld])(\d+)/);
    const model = modelMatch ? modelMatch[0] : '';
    
    // Hashrate: 234, 190, 473, 860, 840 vb. (2-4 basamak)
    const hashMatch = n.match(/(\d{2,4})\s*(th|gh|kh)/i);
    const hash = hashMatch ? hashMatch[1] : '';
    
    // Varyantlar
    const variants: string[] = [];
    if (/\bxp\+/.test(n)) variants.push('xp+');
    else if (/\bxp\b/.test(n)) variants.push('xp');
    if (/\bpro\b/.test(n)) variants.push('pro');
    if (/\bk\s*pro\b/.test(n)) variants.push('kpro');
    if (/hydro|hyd/.test(n)) variants.push('hydro');
    if (/immersion|imm/.test(n)) variants.push('imm');
    if (/\be\s*(exp|xp)/.test(n) || /s21\s*e\b/.test(n)) variants.push('e');
    
    return `${model}-${hash}-${variants.sort().join('-')}`;
  };
  
  const productKey = extractKey(productName);
  
  for (const miner of allProfitData) {
    const minerKey = extractKey(miner.name);
    if (minerKey === productKey && productKey !== '--') {
      console.log(`✅ Key match: ${productName} [${productKey}] -> ${miner.name} ($${miner.dailyProfitUsd})`);
      return miner;
    }
  }
  
  // 4. Sadece model ve hashrate eşleşmesi (variant olmadan)
  const extractBasic = (name: string): string => {
    const n = name.toLowerCase();
    const modelMatch = n.match(/([stzld])(\d+)/);
    const model = modelMatch ? modelMatch[0] : '';
    const hashMatch = n.match(/(\d{2,4})\s*(th|gh|kh)/i);
    const hash = hashMatch ? hashMatch[1] : '';
    return `${model}-${hash}`;
  };
  
  const productBasic = extractBasic(productName);
  for (const miner of allProfitData) {
    const minerBasic = extractBasic(miner.name);
    if (minerBasic === productBasic && productBasic !== '-') {
      console.log(`✅ Basic match: ${productName} [${productBasic}] -> ${miner.name} ($${miner.dailyProfitUsd})`);
      return miner;
    }
  }
  
  console.log(`❌ No profit match for ${productName} [key: ${productKey}]`);
  return null;
}
