import React, { useState, useEffect } from 'react';
import { siaService } from '../services/mockBackend';
import { PPbb, StatusDokumen, Supplier } from '../types';
import { ShoppingCart, FilePlus, ChevronRight } from 'lucide-react';

const PurchasingView: React.FC = () => {
  const [requests, setRequests] = useState<PPbb[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedReq, setSelectedReq] = useState<PPbb | null>(null);
  const [vendorId, setVendorId] = useState('');
  const [price, setPrice] = useState(0);

  const fetchData = () => {
    setRequests(siaService.getPPbbs().filter(r => r.status === StatusDokumen.REQ_PENDING));
    setSuppliers(siaService.getSuppliers());
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateSOPB = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !vendorId) return;

    try {
        siaService.createSOPB(selectedReq.id, vendorId, price);
        alert("Purchase Order (SOPB) Created & Sent to Vendor!");
        setSelectedReq(null);
        setVendorId('');
        setPrice(0);
        fetchData();
    } catch (err) {
        alert(err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShoppingCart className="text-cyan-600" />
          Purchasing Department
        </h2>
        <p className="text-slate-500 mt-1">Process Purchase Requisitions (PPbb) into Purchase Orders (SOPB).</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List of Requests */}
        <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold text-slate-700 uppercase text-xs tracking-wider">Pending Requisitions</h3>
            {requests.length === 0 ? (
                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-slate-400 text-sm">No pending requests</div>
            ) : (
                requests.map(req => (
                    <div 
                        key={req.id} 
                        onClick={() => setSelectedReq(req)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedReq?.id === req.id ? 'bg-cyan-50 border-cyan-500 ring-1 ring-cyan-500' : 'bg-white border-slate-200 hover:border-cyan-300'}`}
                    >
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-800">{req.itemName}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded">{req.requester}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">Qty: <span className="font-mono font-bold">{req.qtyRequested}</span></p>
                        <p className="text-xs text-slate-400 mt-2">Ref: {req.id}</p>
                    </div>
                ))
            )}
        </div>

        {/* Action Area */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 h-full">
                {!selectedReq ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <FilePlus size={48} className="mb-4 opacity-20" />
                        <p>Select a Requisition to create an Order.</p>
                    </div>
                ) : (
                    <form onSubmit={handleCreateSOPB} className="space-y-6">
                        <div className="border-b border-slate-100 pb-4 mb-6">
                            <span className="text-xs text-slate-400 uppercase font-bold">Creating Order For</span>
                            <h3 className="text-xl font-bold text-slate-900">{selectedReq.itemName}</h3>
                            <p className="text-slate-500 text-sm">Qty: {selectedReq.qtyRequested} units</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Select Supplier</label>
                            <select 
                                required 
                                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-cyan-500"
                                value={vendorId}
                                onChange={e => setVendorId(e.target.value)}
                            >
                                <option value="">-- Choose Vendor --</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Agreed Price per Unit (Rp)</label>
                            <input 
                                required
                                type="number"
                                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-cyan-500"
                                value={price}
                                onChange={e => setPrice(Number(e.target.value))}
                            />
                            <p className="text-right text-sm text-slate-500 mt-2">
                                Total Estimated: <span className="font-bold text-slate-900">Rp {(price * selectedReq.qtyRequested).toLocaleString()}</span>
                            </p>
                        </div>

                        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
                            Generate SOPB <ChevronRight size={18} />
                        </button>
                    </form>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasingView;