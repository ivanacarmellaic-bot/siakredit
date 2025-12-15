import React from 'react';
import { Package, FileText, BookOpen, Activity, LayoutDashboard, Users, Factory, ShoppingCart } from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRole, setCurrentRole }) => {
  const menus = [
    { role: Role.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { role: Role.SUPPLIER, label: 'Supplier Mgmt', icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
    { role: Role.PRODUKSI, label: 'Produksi (Inventory)', icon: Factory, color: 'text-rose-500', bg: 'bg-rose-50' },
    { role: Role.PEMBELIAN, label: 'Pembelian (Purchase)', icon: ShoppingCart, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { role: Role.GUDANG, label: 'Gudang (Warehouse)', icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { role: Role.KEUANGAN, label: 'Keuangan (Finance)', icon: FileText, color: 'text-green-500', bg: 'bg-green-50' },
    { role: Role.AKUNTANSI, label: 'Akuntansi (Reports)', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600" />
          <h1 className="font-bold text-xl text-slate-800">SIA Kredit</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">Integrated System</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Main Modules</p>
        <div className="space-y-1">
          {menus.map((menu) => (
            <button
              key={menu.role}
              onClick={() => setCurrentRole(menu.role)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentRole === menu.role 
                  ? `${menu.bg} ${menu.color} shadow-sm ring-1 ring-inset ring-slate-200` 
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <menu.icon size={18} />
              <span className="font-medium text-sm">{menu.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Admin User</p>
            <p className="text-xs text-slate-500">Full Access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;