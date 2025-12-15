import React, { useState, useEffect } from 'react';
import { siaService } from '../services/mockBackend';
import { auditJournalEntry } from '../services/geminiService';
import { JurnalEntry } from '../types';
import { BookOpen, Sparkles, FileSpreadsheet } from 'lucide-react';

const AccountingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'JOURNAL' | 'REPORT'>('JOURNAL');
  const [journals, setJournals] = useState<JurnalEntry[]>([]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{[key: string]: string}>({});
  const [reportData, setReportData] = useState<any[]>([]);

  const fetchData = () => {
    setJournals([...siaService.getJurnal()]);
    
    // Generate Report Data from Mock Backend
    const fakturs = siaService.getFakturs();
    const sjs = siaService.getSuratJalan();
    
    // Group by Vendor
    const reportMap = new Map();
    fakturs.forEach(f => {
        const sj = sjs.find(s => s.id === f.suratJalanId);
        const vendor = sj ? sj.vendorName : 'Unknown';
        
        if (!reportMap.has(vendor)) {
            reportMap.set(vendor, { vendor, totalPurchase: 0, outstanding: 0, invoiceCount: 0 });
        }
        
        const entry = reportMap.get(vendor);
        entry.totalPurchase += f.totalAmount;
        if (f.status === 'UNPAID') entry.outstanding += f.totalAmount;
        entry.invoiceCount += 1;
    });
    setReportData(Array.from(reportMap.values()));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll for new automated entries
    return () => clearInterval(interval);
  }, []);

  const handleAudit = async (entry: JurnalEntry) => {
    setAnalyzingId(entry.id);
    const result = await auditJournalEntry(entry);
    setAnalysisResult(prev => ({ ...prev, [entry.id]: result }));
    setAnalyzingId(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="text-purple-600" />
            Accounting Department
          </h2>
          <p className="text-slate-500 mt-1">General Ledger & Credit Purchase Reports.</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
            <button 
                onClick={() => setActiveTab('JOURNAL')} 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'JOURNAL' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Journal Entries
            </button>
            <button 
                onClick={() => setActiveTab('REPORT')} 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'REPORT' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Reports
            </button>
        </div>
      </header>

      {activeTab === 'JOURNAL' ? (
        <div className="space-y-6">
            {journals.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <BookOpen className="text-slate-300 mx-auto mb-4" size={32} />
                <h3 className="text-lg font-medium text-slate-900">No Journal Entries Yet</h3>
                <p className="text-slate-500">Entries will appear here automatically when Finance processes an invoice.</p>
            </div>
            ) : (
            journals.map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800">{entry.id}</h3>
                        <p className="text-xs text-slate-500">{new Date(entry.date).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">{entry.description}</p>
                        <p className="text-xs text-slate-400">Ref: {entry.fakturId}</p>
                    </div>
                </div>

                <div className="p-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-slate-400 border-b border-slate-100">
                                <th className="text-left py-2 font-medium w-1/2">Account</th>
                                <th className="text-right py-2 font-medium">Debit</th>
                                <th className="text-right py-2 font-medium">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-slate-700">
                            {entry.debit.map((d, i) => (
                                <tr key={`dr-${i}`}>
                                    <td className="py-2">{d.account}</td>
                                    <td className="text-right py-2">Rp {d.amount.toLocaleString()}</td>
                                    <td className="text-right py-2">-</td>
                                </tr>
                            ))}
                            {entry.credit.map((c, i) => (
                                <tr key={`cr-${i}`}>
                                    <td className="py-2 pl-8">{c.account}</td>
                                    <td className="text-right py-2">-</td>
                                    <td className="text-right py-2">Rp {c.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                        {!analysisResult[entry.id] ? (
                            <button 
                                onClick={() => handleAudit(entry)}
                                disabled={analyzingId === entry.id}
                                className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
                            >
                                {analyzingId === entry.id ? (
                                    <span className="animate-pulse">Analysing with Gemini...</span>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        AI Audit this Entry
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                <div className="flex items-center gap-2 mb-2 text-purple-800 font-bold text-xs uppercase tracking-wider">
                                    <Sparkles size={14} /> Gemini Auditor Report
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    {analysisResult[entry.id]}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                </div>
            ))
            )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileSpreadsheet className="text-green-600" size={20} />
                    Laporan Pembelian Kredit (Credit Purchase Report)
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Vendor Name</th>
                            <th className="px-6 py-4 text-center">Invoices</th>
                            <th className="px-6 py-4 text-right">Total Purchase</th>
                            <th className="px-6 py-4 text-right">Outstanding Debt (Hutang)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reportData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-800">{row.vendor}</td>
                                <td className="px-6 py-4 text-center">{row.invoiceCount}</td>
                                <td className="px-6 py-4 text-right font-mono">Rp {row.totalPurchase.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-mono text-red-600 font-bold">Rp {row.outstanding.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default AccountingView;