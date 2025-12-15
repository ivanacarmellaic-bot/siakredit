import React, { useEffect, useState } from 'react';
import { siaService } from '../services/mockBackend';
import { TrendingUp, AlertCircle, Clock, Wallet } from 'lucide-react';

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState({
    totalDebt: 0,
    lowStockCount: 0,
    pendingOrders: 0,
    openInvoices: 0
  });

  useEffect(() => {
    const fetchData = () => {
      const inv = siaService.getInventory();
      const sjs = siaService.getSuratJalan();
      const fakturs = siaService.getFakturs();
      
      setStats({
        totalDebt: fakturs.filter(f => f.status === 'UNPAID').reduce((sum, f) => sum + f.totalAmount, 0),
        lowStockCount: inv.filter(i => i.stock <= i.safetyStock).length,
        pendingOrders: sjs.filter(s => s.status === 'TERKIRIM').length,
        openInvoices: fakturs.filter(f => f.status === 'UNPAID').length
      });
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { label: 'Outstanding Debt', value: `Rp ${stats.totalDebt.toLocaleString()}`, icon: Wallet, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Low Stock Items', value: stats.lowStockCount, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Pending Deliveries', value: stats.pendingOrders, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Unpaid Invoices', value: stats.openInvoices, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Executive Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${card.bg}`}>
              <card.icon className={card.color} size={24} />
            </div>
            <p className="text-sm text-slate-500 font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-4">System Activity</h3>
           <div className="space-y-4">
             <div className="flex items-center gap-4 text-sm">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               <p className="flex-1 text-slate-600">Accounting Module</p>
               <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">Active</span>
             </div>
             <div className="flex items-center gap-4 text-sm">
               <span className="w-2 h-2 rounded-full bg-blue-500"></span>
               <p className="flex-1 text-slate-600">Inventory Sync</p>
               <span className="text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">Syncing</span>
             </div>
           </div>
        </div>
        
        <div className="bg-indigo-900 p-6 rounded-2xl text-white relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
                <p className="text-indigo-200 text-sm mb-6">Navigate to specific modules to handle pending tasks.</p>
                <button className="bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                    View Reports
                </button>
            </div>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-800 rounded-full opacity-50 blur-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;