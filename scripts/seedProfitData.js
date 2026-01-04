// Fallback profit verilerini Supabase'e yaz
const { createClient } = require("@supabase/supabase-js");

// .env.local'dan değerleri al
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase credentials not found!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Senin 11 ürünün için profit verileri
const PROFIT_DATA = [
  { slug: "bitmain-antminer-z15-pro-840-kh-s", name: "Bitmain Antminer Z15 Pro 840 KH/s", daily_profit_usd: 29.12, hashrate: "840 kh/s", power_watts: 2780, algorithm: "Equihash", coin: "Zcash", manufacturer: "Bitmain" },
  { slug: "antminer-t21-190-th", name: "Antminer T21 190 TH", daily_profit_usd: 1.95, hashrate: "190 Th/s", power_watts: 3610, algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s21-xp-hydro-395-th", name: "Antminer S21 XP Hydro 395 TH", daily_profit_usd: 4.15, hashrate: "395 Th/s", power_watts: 5130, algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s21-xp-immersion-300-th", name: "Antminer S21 XP Immersion 300 TH", daily_profit_usd: 3.10, hashrate: "300 Th/s", power_watts: 4050, algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s21-xp-hydro-473-th", name: "Antminer S21 XP Hydro 473 TH", daily_profit_usd: 5.00, hashrate: "473 Th/s", power_watts: 5676, algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s21-e-exp-860-th", name: "Antminer S21 E EXP 860 TH", daily_profit_usd: 6.65, hashrate: "860 Th/s", power_watts: 11180, algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "volcminer-d3-20gh-s-scrypt-miner", name: "VolcMiner D3 20GH/s Scrypt Miner", daily_profit_usd: 6.91, hashrate: "20 Gh/s", power_watts: 3580, algorithm: "Scrypt", coin: "LTC/DOGE", manufacturer: "VolcMiner" },
  { slug: "antminer-s19-xp-hydro-293-th", name: "Antminer S19 XP+ Hydro 293 TH", daily_profit_usd: 2.62, hashrate: "293 Th/s", power_watts: 5418, algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s21-pro-234-th", name: "Antminer S21 Pro 234 TH", daily_profit_usd: 2.45, hashrate: "234 Th/s", power_watts: 3510, algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s19-k-pro", name: "Antminer S19 K Pro", daily_profit_usd: 0.85, hashrate: "120 Th/s", power_watts: 2760, algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
  { slug: "antminer-s21-xp-270-th", name: "Antminer S21 XP 270 TH", daily_profit_usd: 2.80, hashrate: "270 Th/s", power_watts: 3645, algorithm: "SHA-256", coin: "Bitcoin", manufacturer: "Bitmain" },
];

async function seedData() {
  console.log("🌱 Supabase'e profit verileri yazılıyor...");
  
  for (const miner of PROFIT_DATA) {
    const { error } = await supabase
      .from('miner_profits')
      .upsert(miner, { onConflict: 'slug' });
    
    if (error) {
      console.error(`❌ ${miner.name}: ${error.message}`);
    } else {
      console.log(`✅ ${miner.name} -> $${miner.daily_profit_usd}/gün`);
    }
  }
  
  console.log("\n🎉 Tamamlandı!");
}

seedData();
