import React, { useState, useEffect } from 'react';
import { siaService } from '../services/mockBackend';
import { Supplier } from '../types';
import { Users, Plus, Phone, Mail, MapPin } from 'lucide-react';

const SupplierManagementView: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', address: '', contact: '', email: '' });

  useEffect(() => {
    setSuppliers([...siaService.getSuppliers()]);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    siaService.addSupplier({
        id: `SUP-${Date.now().toString().slice(-3)}`,
        ...newSupplier
    });
    setSuppliers([...siaService.getSuppliers()]);
    setShowForm(false);
    setNewSupplier({ name: '', address: '', contact: '', email: '' });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="text-orange-600" />
                Supplier Management
            </h2>
            <p className="text-slate-500 mt-1">Manage approved vendors list.</p>
        </div>
        <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors shadow-sm"
        >
            <Plus size={18} /> Add Supplier
        </button>
      </header>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-sm mb-8 animate-fade-in">
            <h3 className="font-bold text-slate-800 mb-4">Register New Supplier</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Company Name" className="border p-2 rounded" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} />
                <input required placeholder="Email" type="email" className="border p-2 rounded" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} />
                <input required placeholder="Phone Contact" className="border p-2 rounded" value={newSupplier.contact} onChange={e => setNewSupplier({...newSupplier, contact: e.target.value})} />
                <input required placeholder="Address" className="border p-2 rounded" value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} />
                <button type="submit" className="col-span-2 bg-slate-800 text-white py-2 rounded hover:bg-slate-900">Save Supplier</button>
            </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map(sup => (
            <div key={sup.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-slate-800">{sup.name}</h3>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">{sup.id}</span>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><MapPin size={14} /> {sup.address}</p>
                    <p className="flex items-center gap-2"><Phone size={14} /> {sup.contact}</p>
                    <p className="flex items-center gap-2"><Mail size={14} /> {sup.email}</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default SupplierManagementView;