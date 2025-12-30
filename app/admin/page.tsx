'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, X, LogOut, Home, Package, ShoppingCart, Users, Settings, 
  TrendingUp, DollarSign, Search, Plus, Edit, Trash2, Eye,
  ChevronDown, Filter, Download, Upload, BarChart3, Activity,
  AlertCircle, CheckCircle, Clock, Zap
} from 'lucide-react';
import { text } from 'stream/consumers';

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Örnek istatistikler - Supabase'den gelecek
  const stats = [
    { label: 'Toplam Satış', value: '₺2.450.000', change: '+12.5%', icon: DollarSign, color: 'cyan',text: 'Toplam Satış' },
    { label: 'Siparişler', value: '156', change: '+8.2%', icon: ShoppingCart, color: 'blue', text: 'Siparişler' },
    { label: 'Ürünler', value: '24', change: '+3', icon: Package, color: 'purple', text: 'Ürünler' },
    { label: 'Müşteriler', value: '89', change: '+15.3%', icon: Users, color: 'green', text: 'Müşteriler'    }
  ];

  // Örnek ürünler - Supabase'den gelecek
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Bitmain Antminer S19 XP",
      category: "Bitcoin ASIC",
      hashrate: "140 TH/s",
      power: "3010W",
      price: 285000,
      stock: 12,
      status: "active",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&q=80"
    },
    {
      id: 2,
      name: "Whatsminer M50S",
      category: "Bitcoin ASIC",
      hashrate: "126 TH/s",
      power: "3276W",
      price: 245000,
      stock: 8,
      status: "active",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80"
    },
    {
      id: 3,
      name: "Bitmain Antminer L7",
      category: "Litecoin ASIC",
      hashrate: "9.5 GH/s",
      power: "3425W",
      price: 195000,
      stock: 5,
      status: "low_stock",
      image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&q=80"
    },
    {
      id: 4,
      name: "Goldshell KD6",
      category: "Kadena ASIC",
      hashrate: "29.2 TH/s",
      power: "2630W",
      price: 165000,
      stock: 0,
      status: "out_of_stock",
      image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80"
    }
  ]);

  // Örnek siparişler
  const orders = [
    { id: "ORD-2024-001", customer: "Ahmet Yılmaz", product: "Antminer S19 XP", amount: 285000, status: "completed", date: "2024-12-28" },
    { id: "ORD-2024-002", customer: "Mehmet Kaya", product: "Whatsminer M50S", amount: 245000, status: "processing", date: "2024-12-28" },
    { id: "ORD-2024-003", customer: "Ayşe Demir", product: "Antminer L7", amount: 195000, status: "pending", date: "2024-12-27" },
    { id: "ORD-2024-004", customer: "Fatma Çelik", product: "Goldshell KD6", amount: 165000, status: "shipped", date: "2024-12-27" }
  ];1

//   const getStatusColor = (status) => {
//     const colors = {
//       active: 'bg-green-500/20 text-green-400 border-green-500/30',
//       low_stock: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
//       out_of_stock: 'bg-red-500/20 text-red-400 border-red-500/30',
//       completed: 'bg-green-500/20 text-green-400 border-green-500/30',
//       processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
//       pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
//       shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
//     };
//     return colors[status] || colors.pending;
//   };

//   const getStatusText = (status) => {
//     const texts = {
//       active: 'Aktif',
//       low_stock: 'Düşük Stok',
//       out_of_stock: 'Stokta Yok',
//       completed: 'Tamamlandı',
//       processing: 'İşleniyor',
//       pending: 'Bekliyor',
//       shipped: 'Kargoya Verildi'
//     };
//     return texts[status] || status;
//   };

  // Dashboard İçeriği
  const DashboardContent = () => (
    <div className="space-y-6">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card-glow rounded-2xl p-6 glow-hover fade-in">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Satış Grafiği */}
        <div className="card-glow rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Satış Trendi</h3>
            <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
              Detaylı Görüntüle →
            </button>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[65, 45, 78, 52, 88, 72, 95].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-cyan-600 to-blue-500 rounded-t-lg transition-all hover:from-cyan-500 hover:to-blue-400"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-400 mt-2">{['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][idx]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="card-glow rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Son Aktiviteler</h3>
          <div className="space-y-4">
            {[
              { text: 'Yeni sipariş alındı', time: '5 dk önce', icon: ShoppingCart, color: 'cyan' },
              { text: 'Stok güncellendi', time: '12 dk önce', icon: Package, color: 'blue' },
              { text: 'Yeni müşteri kaydı', time: '25 dk önce', icon: Users, color: 'green' },
              { text: 'Ürün fiyatı değişti', time: '1 saat önce', icon: TrendingUp, color: 'purple' }
            ].map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={idx} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className={`p-2 rounded-lg bg-${activity.color}-500/20`}>
                    <Icon className={`w-4 h-4 text-${activity.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.text}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Son Siparişler */}
      <div className="card-glow rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Son Siparişler</h3>
          <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
            Tümünü Gör →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/20">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Sipariş No</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Müşteri</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Ürün</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Tutar</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Durum</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 text-cyan-300 font-mono text-sm">{order.id}</td>
                  <td className="py-4 px-4 text-white">{order.customer}</td>
                  <td className="py-4 px-4 text-gray-300">{order.product}</td>
                  <td className="py-4 px-4 text-white font-semibold">₺{order.amount.toLocaleString('tr-TR')}</td>
                  <td className="py-4 px-4">
                    {/* <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Ürünler İçeriği
  const ProductsContent = () => (
    <div className="space-y-6">
      {/* Başlık ve Filtreler */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Ürün Yönetimi</h2>
          <p className="text-gray-400">Toplam {products.length} ürün</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 md:flex-initial md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button className="px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-xl hover:bg-slate-800 transition-colors">
            <Filter className="w-5 h-5 text-gray-400" />
          </button>
          <button 
            onClick={() => setShowProductModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center space-x-2 glow-hover"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Ürün</span>
          </button>
        </div>
      </div>

      {/* Ürün Tablosu */}
      <div className="card-glow rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Ürün</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Kategori</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Hashrate</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Fiyat</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Stok</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Durum</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="text-white font-semibold">{product.name}</p>
                        <p className="text-gray-400 text-sm">{product.power}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-300">{product.category}</td>
                  <td className="py-4 px-6 text-cyan-300 font-semibold">{product.hashrate}</td>
                  <td className="py-4 px-6 text-white font-semibold">₺{product.price.toLocaleString('tr-TR')}</td>
                  <td className="py-4 px-6">
                    <span className={`text-sm font-semibold ${product.stock < 5 ? 'text-red-400' : product.stock < 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {product.stock} adet
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {/* <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(product.status)}`}>
                      {getStatusText(product.status)}
                    </span> */}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors group">
                        <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                      </button>
                      {/* <button 
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductModal(true);
                        }}
                        className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors group"
                      >
                        <Edit className="w-4 h-4 text-gray-400 group-hover:text-cyan-400" />
                      </button> */}
                      <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group">
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Sipariş İçeriği
  const OrdersContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Sipariş Yönetimi</h2>
          <p className="text-gray-400">Toplam {orders.length} sipariş</p>
        </div>
        <button className="px-6 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-xl hover:bg-slate-800 transition-colors flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Dışa Aktar</span>
        </button>
      </div>

      <div className="card-glow rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Sipariş No</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Müşteri</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Ürün</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Tarih</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Tutar</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Durum</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 text-cyan-300 font-mono text-sm">{order.id}</td>
                  <td className="py-4 px-6 text-white">{order.customer}</td>
                  <td className="py-4 px-6 text-gray-300">{order.product}</td>
                  <td className="py-4 px-6 text-gray-400">{order.date}</td>
                  <td className="py-4 px-6 text-white font-semibold">₺{order.amount.toLocaleString('tr-TR')}</td>
                  <td className="py-4 px-6">
                    {/* <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span> */}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors group">
                        <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                      </button>
                      <button className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors group">
                        <Edit className="w-4 h-4 text-gray-400 group-hover:text-cyan-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-blue-950 text-white">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700;900&family=Orbitron:wght@400;500;700;900&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Exo 2', sans-serif;
        }

        .orbitron {
          font-family: 'Orbitron', sans-serif;
        }

        .glow {
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3),
                      0 0 40px rgba(6, 182, 212, 0.2);
        }

        .glow-hover {
          transition: all 0.3s ease;
        }

        .glow-hover:hover {
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.5),
                      0 0 60px rgba(6, 182, 212, 0.3);
          transform: translateY(-2px);
        }

        .card-glow {
          background: rgba(6, 182, 212, 0.05);
          border: 1px solid rgba(6, 182, 212, 0.2);
          backdrop-filter: blur(10px);
        }

        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sidebar-enter {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-950/95 border-r border-cyan-500/20 transition-all duration-300 flex flex-col`}>
          {/* Logo */}
          <div className="p-6 border-b border-cyan-500/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center glow">
                <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="orbitron text-lg font-black text-cyan-400">ADMIN</h1>
                  <p className="text-xs text-gray-400">Yönetim Paneli</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'dashboard', icon: Home, label: 'Dashboard' },
              { id: 'products', icon: Package, label: 'Ürünler' },
              { id: 'orders', icon: ShoppingCart, label: 'Siparişler' },
              { id: 'customers', icon: Users, label: 'Müşteriler' },
              { id: 'analytics', icon: BarChart3, label: 'Analitik' },
              { id: 'settings', icon: Settings, label: 'Ayarlar' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 glow'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && <span className="font-semibold">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-cyan-500/20">
            <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-xl bg-slate-800/50`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <span className="font-bold">AD</span>
              </div>
              {sidebarOpen && (
                <div className="flex-1">
                  <p className="text-sm font-semibold">Admin User</p>
                  <p className="text-xs text-gray-400">admin@asicstore.com</p>
                </div>
              )}
            </div>
            <button className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-colors text-red-400">
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Çıkış</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-slate-950/95 border-b border-cyan-500/20 px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ara..."
                    className="pl-10 pr-4 py-2 w-64 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                
                <button className="relative p-2 hover:bg-cyan-500/10 rounded-lg transition-colors">
                  <Activity className="w-6 h-6 text-gray-300" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                </button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-8">
            {currentPage === 'dashboard' && <DashboardContent />}
            {currentPage === 'products' && <ProductsContent />}
            {currentPage === 'orders' && <OrdersContent />}
            {currentPage === 'customers' && (
              <div className="text-center py-20">
                <Users className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Müşteri Yönetimi</h3>
                <p className="text-gray-400">Bu sayfa yakında eklenecek...</p>
              </div>
            )}
            {currentPage === 'analytics' && (
              <div className="text-center py-20">
                <BarChart3 className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Analitik ve Raporlar</h3>
                <p className="text-gray-400">Bu sayfa yakında eklenecek...</p>
              </div>
            )}
            {currentPage === 'settings' && (
              <div className="text-center py-20">
                <Settings className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Sistem Ayarları</h3>
                <p className="text-gray-400">Bu sayfa yakında eklenecek...</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Ürün Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-cyan-500/20">
              <h3 className="text-2xl font-bold text-white">
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Ürün Adı</label>
                  <input
                    type="text"
                    placeholder="Ürün adını girin"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Kategori</label>
                  <input
                    type="text"
                    placeholder="Kategori seçin"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Hashrate</label>
                  <input
                    type="text"
                    placeholder="Örn: 140 TH/s"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Güç Tüketimi</label>
                  <input
                    type="text"
                    placeholder="Örn: 3010W"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Fiyat (₺)</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Stok Miktarı</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Açıklama</label>
                <textarea
                //   rows="4"
                  placeholder="Ürün açıklaması..."
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Ürün Görseli</label>
                <div className="border-2 border-dashed border-cyan-500/30 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Dosya yüklemek için tıklayın veya sürükleyin</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-cyan-500/20 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }}
                className="px-6 py-3 bg-slate-800/50 border border-cyan-500/20 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
              >
                İptal
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all">
                {editingProduct ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
