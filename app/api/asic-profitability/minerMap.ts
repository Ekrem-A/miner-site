// Ürün slug → ASICMinerValue URL path eşleşmesi
export const minerMap: Record<string, string> = {
  "bitmain-antminer-z15-pro-840-khs": "bitmain/antminer-z15-pro",
  "antminer-t21-190-th": "bitmain/antminer-t21",
  "s21-xp-hydro-395-th": "bitmain/antminer-s21-xp-hydro",
  "s21-xp-immersion-300-th": "bitmain/antminer-s21-xp-immersion",
  "volcminer-d3-20gh-s-scrypt": "volcminer/volcminer-d3",
  "antminer-s21-e-exp-860-th": "bitmain/antminer-s21e-xp",
  "antminer-s19-xp-plus-hydro-293-th": "bitmain/antminer-s19-xp-hydro",
  "antminer-s21-pro-234-th": "bitmain/antminer-s21-pro",
  "bitmain-antminer-s19-k-pro": "bitmain/antminer-s19-k-pro",
  "antminer-s21-xp-270-th": "bitmain/antminer-s21-xp",
  // Alternatif slug'lar
  "bitmain-antminer-s21-xp-hydro-473-th": "bitmain/antminer-s21-xp-hydro",
  "volcminer-d3-20gh-scrypt": "volcminer/volcminer-d3",
};

// Ürün adından slug oluştur
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Ürün adına göre minerMap'ten path bul
export function findMinerPath(productName: string): string | null {
  const slug = createSlug(productName);
  
  // Direkt eşleşme
  if (minerMap[slug]) return minerMap[slug];
  
  // Kısmi eşleşme
  for (const [key, path] of Object.entries(minerMap)) {
    if (slug.includes(key) || key.includes(slug)) {
      return path;
    }
  }
  
  // Model numarası ile eşleştirme (s21, t21, z15, etc.)
  const modelMatch = productName.match(/(s21|s19|t21|z15|d3|l11|ks\d+)/i);
  if (modelMatch) {
    const model = modelMatch[1].toLowerCase();
    for (const [key, path] of Object.entries(minerMap)) {
      if (key.includes(model)) {
        return path;
      }
    }
  }
  
  return null;
}