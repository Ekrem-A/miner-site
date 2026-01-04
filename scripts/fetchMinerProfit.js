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

// İsimden slug oluştur
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Random delay (bot algılamayı önlemek için)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ASICMinerValue'dan tüm miner verilerini çek
async function fetchMinersFromASIC() {
  console.log("🔍 ASICMinerValue'dan veriler çekiliyor...");

  try {
    // Random delay (2-4 saniye)
    await delay(2000 + Math.random() * 2000);

    const { data: html } = await axios.get(BASE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Referer": "https://www.google.com/",
        "Cache-Control": "no-cache",
      },
      timeout: 30000,
    });

    const $ = cheerio.load(html);
    const miners = [];
    const seenNames = new Set();

    const fullText = $("body").text();
    const manufacturers = [
      "Bitmain",
      "VolcMiner",
      "IceRiver",
      "Jasminer",
      "Goldshell",
      "Canaan",
      "MicroBT",
      "Pinecone",
      "ElphaPex",
      "Bitdeer",
    ];

    // Her profit değerini bul
    const profitPattern = /\$\s*([\d,.]+)\s*\/\s*day/g;
    let profitMatch;

    while ((profitMatch = profitPattern.exec(fullText)) !== null) {
      const profit = parseFloat(profitMatch[1].replace(",", ""));
      if (isNaN(profit) || profit <= 0 || profit > 10000) continue;

      const start = Math.max(0, profitMatch.index - 800);
      const beforeProfit = fullText.slice(start, profitMatch.index);

      for (const mfr of manufacturers) {
        const patterns = [
          new RegExp(
            `${mfr}\\s+${mfr}\\s+([\\w\\s\\-\\+\\.\\d]+?)\\s*\\(\\s*([\\d.,]+\\s*(?:Ph|Th|Gh|Mh|kh))\\s*\\)`,
            "gi"
          ),
          new RegExp(
            `${mfr}\\s+([\\w\\s\\-\\+\\.\\d]+?)\\s*\\(\\s*([\\d.,]+\\s*(?:Ph|Th|Gh|Mh|kh))\\s*\\)`,
            "gi"
          ),
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
            const normalizedName = fullName.toLowerCase().replace(/\s+/g, " ").trim();

            if (model.length < 2 || seenNames.has(normalizedName)) continue;
            seenNames.add(normalizedName);

            // Power
            const powerMatch = beforeProfit.match(/(\d{2,5})\s*W/);
            const power = powerMatch ? parseInt(powerMatch[1]) : null;

            // Algorithm
            const algorithms = ["SHA-256", "Scrypt", "Equihash", "EtHash", "RandomX", "zkSNARK"];
            let algorithm = null;
            for (const alg of algorithms) {
              if (beforeProfit.toLowerCase().includes(alg.toLowerCase())) {
                algorithm = alg;
                break;
              }
            }

            // Coin
            const coinMap = {
              Bitcoin: /Bitcoin|BTC/i,
              "LTC/DOGE": /Litecoin|LTC|Dogecoin|DOGE/i,
              Zcash: /Zcash|ZEC|Horizen/i,
              Monero: /Monero|XMR/i,
              ETC: /Ethereum Classic|ETC/i,
              Aleo: /Aleo/i,
              Kaspa: /Kaspa|KAS/i,
            };

            let coin = null;
            for (const [coinName, coinPat] of Object.entries(coinMap)) {
              if (coinPat.test(beforeProfit)) {
                coin = coinName;
                break;
              }
            }

            miners.push({
              slug: createSlug(fullName),
              name: fullName,
              manufacturer: mfr,
              daily_profit_usd: profit,
              hashrate: hashrate + "/s",
              power_watts: power,
              algorithm,
              coin,
            });
            break;
          }
        }
      }
    }

    console.log(`✅ ${miners.length} miner bulundu`);
    return miners;
  } catch (err) {
    console.error("❌ Scraping hatası:", err.message);
    return [];
  }
}

// Supabase'e kaydet
async function saveToSupabase(miners) {
  if (miners.length === 0) {
    console.log("⚠️ Kaydedilecek veri yok");
    return;
  }

  console.log(`💾 ${miners.length} miner Supabase'e kaydediliyor...`);

  const now = new Date().toISOString();

  for (const miner of miners) {
    try {
      const { error } = await supabase.from("miner_profits").upsert(
        {
          slug: miner.slug,
          name: miner.name,
          manufacturer: miner.manufacturer,
          daily_profit_usd: miner.daily_profit_usd,
          hashrate: miner.hashrate,
          power_watts: miner.power_watts,
          algorithm: miner.algorithm,
          coin: miner.coin,
          updated_at: now,
        },
        { onConflict: "slug" }
      );

      if (error) {
        console.error(`❌ Kayıt hatası (${miner.name}):`, error.message);
      }
    } catch (e) {
      console.error(`❌ Hata (${miner.name}):`, e.message);
    }
  }

  // History tablosuna da kaydet (opsiyonel)
  try {
    const historyRecords = miners.map((m) => ({
      miner_slug: m.slug,
      daily_profit_usd: m.daily_profit_usd,
      recorded_at: now,
    }));

    await supabase.from("miner_profit_history").insert(historyRecords);
    console.log("📊 History kaydedildi");
  } catch (e) {
    // History tablosu yoksa hata vermez
    console.log("ℹ️ History tablosu bulunamadı (opsiyonel)");
  }

  console.log("✅ Kayıt tamamlandı!");
}

// Ana fonksiyon
async function main() {
  console.log("🚀 Miner Profit Scraper başlatıldı");
  console.log(`📅 Tarih: ${new Date().toISOString()}`);

  const miners = await fetchMinersFromASIC();

  if (miners.length > 0) {
    // İlk 5'i göster
    console.log("\n📋 Örnek veriler:");
    miners.slice(0, 5).forEach((m) => {
      console.log(`   ${m.name}: $${m.daily_profit_usd}/gün`);
    });

    await saveToSupabase(miners);
  } else {
    console.log("❌ Hiç miner verisi çekilemedi!");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Kritik hata:", err);
  process.exit(1);
});
