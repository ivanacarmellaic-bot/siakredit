import React, { useState, useEffect } from 'react';
import { siaService } from '../services/mockBackend';
import { SuratJalan, StatusDokumen, SOPB } from '../types';
import { FileText, DollarSign, ArrowRight, AlertTriangle } from 'lucide-react';

const FinanceView: React.FC = () => {
  const [verifiedSJs, setVerifiedSJs] = useState<SuratJalan[]>([]);
  const [sopbs, setSopbs] = useState<SOPB[]>([]);
  
  // Form State
  const [selectedSJ, setSelectedSJ] = useState<string | null>(null);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = () => {
    // Only fetch SJs that are verified by Warehouse but not yet processed by Finance
    const allSJs = siaService.getSuratJalan();
    const readyForInvoice = allSJs.filter(sj => sj.status === StatusDokumen.DITERIMA);
    setVerifiedSJs(readyForInvoice);
    setSopbs(siaService.getSOPBs());
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSJ) return;

    setIsSubmitting(true);
    try {
      // Logic: /api/keuangan/proses_faktur
      await siaService.processInvoice({
        fakturId: invoiceNo,
        suratJalanId: selectedSJ,
        totalAmount: Number(invoiceAmount),
        dueDate: dueDate
      });
      
      // Reset Form
      setSelectedSJ(null);
      setInvoiceNo('');
      setInvoiceAmount('');
      setDueDate('');
      alert("Invoice processed successfully. Journal entry created automatically.");
      fetchData();
    } catch (err) {
      alert("Error processing invoice: " + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to pre-fill amount based on SOPB when an SJ is selected
  const handleSelectSJ = (sjId: string) => {
    setSelectedSJ(sjId);
    const sj = verifiedSJs.find(s => s.id === sjId);
    if (sj) {
        const sopb = sopbs.find(s => s.id === sj.sopbId);
        if (sopb) {
            setInvoiceAmount(sopb.totalAmount.toString());
        }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="text-green-600" />
          Finance Invoice Processing
        </h2>
        <p className="text-slate-500 mt-1">Match Verified Delivery Notes (SJ) with Incoming Invoices.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List of Verified Items waiting for Invoice */}
        <div className="lg:col-span-1 space-y-4">
           <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Waiting for Invoice</h3>
           {verifiedSJs.length === 0 ? (
               <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
                   <p className="text-slate-400 text-sm">No verified items from Warehouse.</p>
               </div>
           ) : (
               verifiedSJs.map(sj => (
                   <button
                    key={sj.id}
                    onClick={() => handleSelectSJ(sj.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedSJ === sj.id 
                        ? 'bg-green-50 border-green-500 ring-1 ring-green-500 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-green-300'
                    }`}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className="font-bold text-slate-800 text-sm">{sj.id}</span>
                           <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                               {sj.sopbId}
                           </span>
                       </div>
                       <p className="text-xs text-slate-500 truncate">{sj.vendorName}</p>
                       <p className="text-xs text-slate-400 mt-1">Rec: {sj.deliveryDate}</p>
                   </button>
               ))
           )}
        </div>

        {/* Form Area */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                {!selectedSJ ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                        <ArrowRight size={48} className="mb-4 opacity-20" />
                        <p>Select a Verified Delivery Note from the left to begin.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex-1">
                                <span className="text-xs text-slate-500 uppercase font-bold">Processing for</span>
                                <p className="text-lg font-bold text-slate-800">{selectedSJ}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-500 uppercase font-bold">Status</span>
                                <p className="text-sm font-medium text-green-600">Goods Verified</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Number (Faktur)</label>
                                <input 
                                    type="text" 
                                    required
                                    value={invoiceNo}
                                    onChange={e => setInvoiceNo(e.target.value)}
                                    placeholder="e.g. INV/2023/XI/001"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                                <input 
                                    type="date" 
                                    required
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Total Amount (Rp)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-500 font-bold">Rp</span>
                                </div>
                                <input 
                                    type="number" 
                                    required
                                    value={invoiceAmount}
                                    onChange={e => setInvoiceAmount(e.target.value)}
                                    className="w-full pl-10 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-mono"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <AlertTriangle size={12} />
                                Verify this matches the physical paper invoice from supplier.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-sm shadow-green-200 transition-all flex items-center gap-2"
                            >
                                {isSubmitting ? 'Processing...' : (
                                    <>
                                        <DollarSign size={18} />
                                        Process Invoice & Create Debt
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceView;