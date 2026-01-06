'use client';

import { TrendingUp, TrendingDown, Zap, Cpu, DollarSign } from 'lucide-react';

interface ProfitData {
  profitPerDayValue: number;
  profitPerDay?: string;
  algorithm?: string;
  hashrate?: string;
  power?: string;
  manufacturer?: string;
  model?: string;
  fullName?: string;
  coins?: string;
}

interface ProductProfitDisplayProps {
  profitData: ProfitData;
}

export default function ProductProfitDisplay({ profitData }: ProductProfitDisplayProps) {
  const dailyProfit = profitData.profitPerDayValue;
  const isPositive = dailyProfit > 0;
  
  // Aylık ve yıllık hesaplamalar
  const monthlyProfit = dailyProfit * 30;
  const yearlyProfit = dailyProfit * 365;

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200 mb-6">
      {/* Ana Profit Gösterimi */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
            {isPositive ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div>
            <p className="text-gray-500 text-sm">Günlük Tahmini Kazanç</p>
            <p className={`orbitron text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(dailyProfit).toFixed(2)}
              <span className="text-lg text-gray-400 ml-1">/gün</span>
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <span className="px-3 py-1 bg-cyan-100 text-cyan-600 text-xs font-semibold rounded-full">
            ASICMinerValue
          </span>
        </div>
      </div>

      {/* Detaylı Kar Bilgileri */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-gray-500 text-xs mb-1">Günlük</p>
          <p className={`font-bold text-lg ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            ${dailyProfit.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-gray-500 text-xs mb-1">Aylık</p>
          <p className={`font-bold text-lg ${monthlyProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${monthlyProfit.toFixed(0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-gray-500 text-xs mb-1">Yıllık</p>
          <p className={`font-bold text-lg ${yearlyProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${yearlyProfit.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Teknik Detaylar */}
      {(profitData.algorithm || profitData.hashrate || profitData.power) && (
        <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-200">
          {profitData.algorithm && (
            <div className="flex items-center gap-1.5 text-sm">
              <Cpu className="w-4 h-4 text-cyan-600" />
              <span className="text-gray-500">Algoritma:</span>
              <span className="text-gray-800 font-medium">{profitData.algorithm}</span>
            </div>
          )}
          {profitData.hashrate && (
            <div className="flex items-center gap-1.5 text-sm">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-gray-500">Hashrate:</span>
              <span className="text-gray-800 font-medium">{profitData.hashrate}</span>
            </div>
          )}
          {profitData.power && (
            <div className="flex items-center gap-1.5 text-sm">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-gray-500">Güç:</span>
              <span className="text-gray-800 font-medium">{profitData.power}</span>
            </div>
          )}
        </div>
      )}

      {/* Coins bilgisi */}
      {profitData.coins && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Kazılabilecek Coinler: <span className="text-cyan-600">{profitData.coins}</span>
          </p>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
        * Elektrik maliyeti: $0.10/kWh baz alınmıştır. Gerçek karlar değişiklik gösterebilir.
      </p>
    </div>
  );
}
