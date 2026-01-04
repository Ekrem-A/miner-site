const axios = require("axios");
const cheerio = require("cheerio");
const { createClient } = require("@supabase/supabase-js");

const BASE_URL = "https://www.asicminervalue.com";

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL veya SUPABASE_SERVICE_KEY tanımlı değil!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SENİN 11 ÜRÜNÜN - asicminervalue.com URL'leri ile eşleşiyor
// URL format: https://www.asicminervalue.com/miners/{manufacturer}/{model}
const MY_PRODUCTS = [
  { 
    slug: "bitmain-antminer-z15-pro-840-khs", 
    name: "Bitmain Antminer Z15 Pro 840 KH/s",
    asicUrl: "/miners/bitmain/antminer-z15-pro",
    hashrate: "840 kh/s",
    algorithm: "Equihash",
    coin: "Zcash",
    manufacturer: "Bitmain"
  },
  { 
    slug: "bitmain-antminer-t21-190-th", 
    name: "Antminer T21 190 TH",
    asicUrl: "/miners/bitmain/antminer-t21-190th",
    hashrate: "190 Th/s",
    algorithm: "SHA-256",
    coin: "Bitcoin",
    manufacturer: "Bitmain"
  },
  { 
    slug: "s21-xp-immersion-300-th", 
    name: "Antminer S21 XP Immersion 300 TH",
    asicUrl: "/miners/bitmain/antminer-s21-xp-immersion-300th",
    hashrate: "300 Th/s",
    algorithm: "SHA-256",
    coin: "Bitcoin",
    manufacturer: "Bitmain"
  },
  { 
    slug: "bitmain-antminer-s21-xp-hydro-473-th", 
    name: "Antminer S21 XP Hydro 473 TH",
    asicUrl: "/miners/bitmain/antminer-s21-xp-hyd-473th",
    hashrate: "473 Th/s",
    algorithm: "SHA-256",
    coin: "Bitcoin",
    manufacturer: "Bitmain"
  },
  { 
    slug: "antminer-s21-e-exp-860-th", 
    name: "Antminer S21 E EXP 860 TH",
    asicUrl: "/miners/bitmain/antminer-s21e-xp-hydro-860th",
    hashrate: "860 Th/s",
    algorithm: "SHA-256",
    coin: "Bitcoin",
    manufacturer: "Bitmain"
  },
  { 
    slug: "volcminer-d3-20gh-s-scrypt", 
    name: "VolcMiner D3 20GH/s Scrypt Miner",
    asicUrl: "/miners/volcminer/d3",
    hashrate: "20 Gh/s",
    algorithm: "Scrypt",
    coin: "LTC/DOGE",
    manufacturer: "VolcMiner"
  },
  { 
    slug: "bitmain-antminer-s19-xp-plus-hydro-293-th", 
    name: "Antminer S19 XP+ Hydro 293 TH",
    asicUrl: "/miners/bitmain/antminer-s19-xp-plus-hyd-293th",
    hashrate: "293 Th/s",
    algorithm: "SHA-256",
    coin: "Bitcoin",
    manufacturer: "Bitmain"
  },
  { 
    slug: "antminer-s21-pro-234-th", 
    name: "Antminer S21 Pro 234 TH",
    asicUrl: "/miners/bitmain/antminer-s21-pro-234th",
    hashrate: "234 Th/s",
    algorithm: "SHA-256",
    coin: "Bitcoin",
    manufacturer: "Bitmain"
  },
  { 
    slug: "antminer-s19-k-pro", 
    name: "Antminer S19 K Pro",
    asicUrl: "/miners/bitmain/antminer-s19k-pro-120th",
    hashrate: "120 Th/s",
    algorithm: "SHA-256",
    coin: "Bitcoin",
    manufacturer: "Bitmain"
  },
  { 
    slug: "bitmain-antminer-s21-xp-270-th", 
    name: "Antminer S21 XP 270 TH",
    asicUrl: "/miners/bitmain/antmine-s21-xp-270th",
    hashrate: "270 Th/s",
    algorithm: "SHA-256",
    coin: "Bitcoin",
    manufacturer: "Bitmain"
  },
];

// Random delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Tek bir ürünün detay sayfasından INCOME çek (electricity hesabını sen yapacaksın)
async function fetchProductProfit(product) {
  const url = BASE_URL + product.asicUrl;
  
  try {
    await delay(1000 + Math.random() * 1500); // Rate limiting

    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);
    
    // Income değerini bul - tablodaki "Income" satırındaki Daily değeri
    // Format: Income $XX.XX (Daily kolonu)
    const pageText = $("body").text();
    
    // Income satırını bul - "Income$XX.XX" veya "Income $XX.XX" formatında
    const incomeMatch = pageText.match(/Income\s*\$\s*([\d,.]+)/i);
    
    if (incomeMatch) {
      const income = parseFloat(incomeMatch[1].replace(",", ""));
      if (!isNaN(income) && income > 0 && income < 1000) {
        return income;
      }
    }
    
    // Alternatif: Profit değerini de dene (bazı sayfalarda farklı format olabilir)
    const profitMatch = pageText.match(/\$\s*([\d,.]+)\s*\/day/i);
    if (profitMatch) {
      const profit = parseFloat(profitMatch[1].replace(",", ""));
      if (!isNaN(profit) && Math.abs(profit) < 500) {
        // Negatif profit olabilir, ama biz income istiyoruz
        // Income genelde profit + electricity
        return null; // Income bulunamadı
      }
    }
    
    return null;
  } catch (err) {
    console.error(`   ❌ ${product.name}: ${err.message}`);
    return null;
  }
}

// Tüm ürünlerin profit'lerini çek
async function fetchMyProductsProfits() {
  console.log("🔍 ASICMinerValue'dan her ürünün detay sayfasından profit çekiliyor...\n");

  const results = [];

  for (const product of MY_PRODUCTS) {
    process.stdout.write(`   ${product.name}... `);
    
    const profit = await fetchProductProfit(product);
    
    if (profit !== null) {
      console.log(`✅ $${profit}/gün`);
      results.push({
        ...product,
        daily_profit_usd: profit,
      });
    } else {
      console.log(`❌ Bulunamadı`);
    }
  }

  console.log(`\n📊 ${results.length}/${MY_PRODUCTS.length} ürün için profit bulundu`);
  return results;
}

// Supabase'e kaydet
async function saveToSupabase(products) {
  if (products.length === 0) {
    console.log("⚠️ Kaydedilecek veri yok");
    return;
  }

  console.log(`\n💾 ${products.length} ürün Supabase'e kaydediliyor...`);
  const now = new Date().toISOString();

  for (const product of products) {
    try {
      const { error } = await supabase.from("miner_profits").upsert(
        {
          slug: product.slug,
          name: product.name,
          manufacturer: product.manufacturer,
          daily_profit_usd: product.daily_profit_usd,
          hashrate: product.hashrate,
          algorithm: product.algorithm,
          coin: product.coin,
          updated_at: now,
        },
        { onConflict: "slug" }
      );

      if (error) {
        console.error(`❌ Kayıt hatası (${product.name}):`, error.message);
      } else {
        console.log(`   ✓ ${product.name}: $${product.daily_profit_usd}`);
      }
    } catch (e) {
      console.error(`❌ Hata (${product.name}):`, e.message);
    }
  }

  console.log("✅ Kayıt tamamlandı!");
}

// Ana fonksiyon
async function main() {
  console.log("🚀 Miner Profit Scraper başlatıldı");
  console.log(`📅 Tarih: ${new Date().toISOString()}`);
  console.log(`🎯 Hedef: Senin ${MY_PRODUCTS.length} ürünün\n`);

  const products = await fetchMyProductsProfits();

  if (products.length > 0) {
    await saveToSupabase(products);
  } else {
    console.log("❌ Hiç ürün bulunamadı!");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Kritik hata:", err);
  process.exit(1);
});
