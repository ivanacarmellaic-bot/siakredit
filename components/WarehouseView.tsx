import React, { useState, useEffect } from 'react';
import { siaService } from '../services/mockBackend';
import { SuratJalan, StatusDokumen } from '../types';
import { CheckCircle, PackageCheck, Truck } from 'lucide-react';

const WarehouseView: React.FC = () => {
  const [suratJalanList, setSuratJalanList] = useState<SuratJalan[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = () => {
    setSuratJalanList([...siaService.getSuratJalan()]);
  };

  useEffect(() => {
    fetchData();
    // Poll for updates in this simulation
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (sj: SuratJalan) => {
    if (!confirm(`Confirm receipt of goods for ${sj.id}? This will update stock and notify Finance.`)) return;

    setProcessingId(sj.id);
    setLoading(true);

    try {
      // Logic: /api/gudang/verifikasi_penerimaan
      await siaService.verifyGoodsReceipt(sj.sopbId, sj.id, true);
      fetchData();
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  };

  const pendingSJs = suratJalanList.filter(sj => sj.status === StatusDokumen.TERKIRIM);
  const verifiedSJs = suratJalanList.filter(sj => sj.status === StatusDokumen.DITERIMA || sj.status === StatusDokumen.DIPROSES);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <PackageCheck className="text-blue-600" />
          Warehouse Receiving
        </h2>
        <p className="text-slate-500 mt-1">Verify incoming shipments against Purchase Orders (SOPB).</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-amber-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-amber-800 flex items-center gap-2">
              <Truck size={18} /> Incoming Shipments
            </h3>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">
              {pendingSJs.length} Pending
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingSJs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic">No pending shipments.</div>
            ) : (
              pendingSJs.map(sj => (
                <div key={sj.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800">{sj.vendorName}</h4>
                      <p className="text-sm text-slate-500">SJ Ref: {sj.id}</p>
                      <p className="text-xs text-slate-400 mt-1">Date: {sj.deliveryDate}</p>
                    </div>
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      Linked to: {sj.sopbId}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Items to Verify:</p>
                    <ul className="space-y-1">
                      {sj.itemsReceived.map((item, idx) => (
                        <li key={idx} className="text-sm flex justify-between text-slate-700">
                          <span>{item.name}</span>
                          <span className="font-mono">{item.qty} units</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleVerify(sj)}
                    disabled={loading && processingId === sj.id}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    {loading && processingId === sj.id ? 'Processing...' : (
                      <>
                        <CheckCircle size={16} /> Verify Receipt
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* History Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Verification History</h3>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
              {verifiedSJs.length} Verified
            </span>
          </div>
          <div className="divide-y divide-slate-100">
             {verifiedSJs.map(sj => (
               <div key={sj.id} className="p-4 flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-slate-800">{sj.id}</p>
                   <p className="text-xs text-slate-500">{sj.vendorName}</p>
                 </div>
                 <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                   <CheckCircle size={12} />
                   <span className="text-xs font-bold">Verified</span>
                 </div>
               </div>
             ))}
             {verifiedSJs.length === 0 && <div className="p-6 text-center text-slate-400 text-sm">No history yet.</div>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default WarehouseView;