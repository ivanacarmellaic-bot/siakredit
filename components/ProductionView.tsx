import React, { useState, useEffect } from 'react';
import { siaService } from '../services/mockBackend';
import { InventoryItem } from '../types';
import { Factory, AlertTriangle, PlusCircle, Check } from 'lucide-react';

const ProductionView: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requestingItem, setRequestingItem] = useState<string | null>(null);
  const [qty, setQty] = useState(0);

  const fetchData = () => {
    setInventory([...siaService.getInventory()]);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Sync stock updates
    return () => clearInterval(interval);
  }, []);

  const handleRequest = (item: InventoryItem) => {
    if (qty <= 0) return alert("Quantity must be > 0");
    siaService.createPPbb(item, qty);
    alert(`Request (PPbb) created for ${item.name}`);
    setRequestingItem(null);
    setQty(0);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Factory className="text-rose-600" />
          Production & Inventory
        </h2>
        <p className="text-slate-500 mt-1">Monitor Raw Materials and Request Restock (PPbb).</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Current Stock</th>
                    <th className="px-6 py-4">Safety Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {inventory.map(item => {
                    const isLow = item.stock <= item.safetyStock;
                    return (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-800">
                                {item.name}
                                <div className="text-xs text-slate-400 font-normal">{item.id}</div>
                            </td>
                            <td className="px-6 py-4 font-mono">{item.stock} {item.unit}</td>
                            <td className="px-6 py-4 font-mono text-slate-500">{item.safetyStock}</td>
                            <td className="px-6 py-4">
                                {isLow ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                                        <AlertTriangle size={12} /> Low Stock
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        <Check size={12} /> OK
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {requestingItem === item.id ? (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            className="w-20 border rounded px-2 py-1"
                                            value={qty}
                                            onChange={(e) => setQty(Number(e.target.value))}
                                            placeholder="Qty"
                                        />
                                        <button onClick={() => handleRequest(item)} className="bg-slate-900 text-white px-3 py-1 rounded text-xs">Confirm</button>
                                        <button onClick={() => setRequestingItem(null)} className="text-slate-400 text-xs hover:text-slate-600">Cancel</button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => { setRequestingItem(item.id); setQty(item.safetyStock * 2); }}
                                        className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1 text-xs"
                                    >
                                        <PlusCircle size={14} /> Request Purchase
                                    </button>
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductionView;