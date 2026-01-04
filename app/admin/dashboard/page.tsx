'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, ShoppingBag, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get total products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get total orders
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount');

      const revenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    {
      icon: Package,
      label: 'Toplam Ürün',
      value: stats.totalProducts,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: ShoppingBag,
      label: 'Toplam Sipariş',
      value: stats.totalOrders,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      label: 'Toplam Gelir',
      value: `${stats.totalRevenue.toLocaleString('tr-TR')} ₺`,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-600">Admin paneline hoş geldiniz</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</h3>
              <p className="text-slate-600 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Hızlı İşlemler</h2>
          <div className="space-y-3">
            <a
              href="/admin/products"
              className="block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all text-center"
            >
              Yeni Ürün Ekle
            </a>
            <a
              href="/admin/orders"
              className="block border-2 border-cyan-500 text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition-all text-center"
            >
              Siparişleri Görüntüle
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Son Aktiviteler</h2>
          <p className="text-slate-600 text-sm">Yakında eklenecek...</p>
        </div>
      </div>
    </div>
  );
}
