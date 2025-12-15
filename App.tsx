import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import WarehouseView from './components/WarehouseView';
import FinanceView from './components/FinanceView';
import AccountingView from './components/AccountingView';
import DashboardView from './components/DashboardView';
import SupplierManagementView from './components/SupplierManagementView';
import ProductionView from './components/ProductionView';
import PurchasingView from './components/PurchasingView';
import { Role } from './types';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<Role>(Role.DASHBOARD);

  const renderView = () => {
    switch (currentRole) {
      case Role.DASHBOARD:
        return <DashboardView />;
      case Role.SUPPLIER:
        return <SupplierManagementView />;
      case Role.PRODUKSI:
        return <ProductionView />;
      case Role.PEMBELIAN:
        return <PurchasingView />;
      case Role.GUDANG:
        return <WarehouseView />;
      case Role.KEUANGAN:
        return <FinanceView />;
      case Role.AKUNTANSI:
        return <AccountingView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar currentRole={currentRole} setCurrentRole={setCurrentRole} />
      
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Top Header */}
        <div className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-2">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Workspace</span>
             <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
               {currentRole}
             </span>
           </div>
           <div className="text-xs text-slate-400 flex gap-4">
             <span>SIA Kredit v2.0</span>
             <span className="text-green-500 font-bold">• Online</span>
           </div>
        </div>

        <div className="animate-fade-in pb-12">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;