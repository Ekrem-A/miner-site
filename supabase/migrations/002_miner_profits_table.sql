-- Miner Profits Tablosu (Ana tablo)
CREATE TABLE IF NOT EXISTS miner_profits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  manufacturer TEXT,
  daily_profit_usd DECIMAL(10,2),
  hashrate TEXT,
  power_watts INTEGER,
  algorithm TEXT,
  coin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Miner Profit History Tablosu (Günlük kayıtlar için)
CREATE TABLE IF NOT EXISTS miner_profit_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  miner_slug TEXT NOT NULL,
  daily_profit_usd DECIMAL(10,2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_miner_profits_slug ON miner_profits(slug);
CREATE INDEX IF NOT EXISTS idx_miner_profit_history_slug ON miner_profit_history(miner_slug);
CREATE INDEX IF NOT EXISTS idx_miner_profit_history_date ON miner_profit_history(recorded_at);

-- RLS (Row Level Security) - Public read access
ALTER TABLE miner_profits ENABLE ROW LEVEL SECURITY;
ALTER TABLE miner_profit_history ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "Public read access" ON miner_profits FOR SELECT USING (true);
CREATE POLICY "Public read access" ON miner_profit_history FOR SELECT USING (true);

-- Service role yazabilir
CREATE POLICY "Service role write access" ON miner_profits FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write access" ON miner_profit_history FOR ALL USING (auth.role() = 'service_role');
