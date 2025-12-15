import { SOPB, SuratJalan, Faktur, JurnalEntry, StatusDokumen, InvoiceRequest, Supplier, InventoryItem, PPbb } from '../types';

// --- Initial Mock Data ---

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'SUP-001', name: 'PT. Teknologi Maju', address: 'Jl. Sudirman No. 1', contact: '0812345678', email: 'sales@techmaju.com' },
  { id: 'SUP-002', name: 'CV. Office Supplies', address: 'Jl. Thamrin No. 2', contact: '0819876543', email: 'info@officesupplies.com' },
  { id: 'SUP-003', name: 'UD. Baja Perkasa', address: 'Kawasan Industri A1', contact: '021-555666', email: 'orders@bajaperkasa.com' }
];

const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'ITEM-001', name: 'Processor Chipset X1', stock: 15, safetyStock: 20, unit: 'pcs', lastPrice: 2500000 },
  { id: 'ITEM-002', name: 'Steel Plate 5mm', stock: 100, safetyStock: 50, unit: 'sheet', lastPrice: 500000 },
  { id: 'ITEM-003', name: 'Packaging Box', stock: 20, safetyStock: 200, unit: 'pcs', lastPrice: 5000 },
];

const MOCK_PPBB: PPbb[] = [
  { id: 'REQ-23-001', itemId: 'ITEM-003', itemName: 'Packaging Box', qtyRequested: 500, requestDate: '2023-10-01', status: StatusDokumen.REQ_PENDING, requester: 'Produksi' }
];

const MOCK_SOPB: SOPB[] = [
  {
    id: 'SOPB-001',
    vendorId: 'SUP-001',
    vendorName: 'PT. Teknologi Maju',
    items: [
      { name: 'Laptop High-End', qty: 5, price: 15000000 },
      { name: 'Mouse Wireless', qty: 10, price: 200000 }
    ],
    totalAmount: 77000000,
    orderDate: '2023-10-01',
    status: StatusDokumen.TERKIRIM
  },
  {
    id: 'SOPB-002',
    vendorId: 'SUP-002',
    vendorName: 'CV. Office Supplies',
    items: [
      { name: 'Kertas A4', qty: 50, price: 45000 },
      { name: 'Tinta Printer', qty: 20, price: 150000 }
    ],
    totalAmount: 5250000,
    orderDate: '2023-10-05',
    status: StatusDokumen.TERKIRIM
  }
];

const MOCK_SJ: SuratJalan[] = [
  {
    id: 'SJ-INV-888',
    sopbId: 'SOPB-001',
    vendorName: 'PT. Teknologi Maju',
    deliveryDate: '2023-10-03',
    status: StatusDokumen.TERKIRIM,
    itemsReceived: [
        { name: 'Laptop High-End', qty: 5, condition: 'Good' },
        { name: 'Mouse Wireless', qty: 10, condition: 'Good' }
    ]
  },
  {
    id: 'SJ-OFF-101',
    sopbId: 'SOPB-002',
    vendorName: 'CV. Office Supplies',
    deliveryDate: '2023-10-06',
    status: StatusDokumen.TERKIRIM,
    itemsReceived: [
        { name: 'Kertas A4', qty: 50, condition: 'Good' },
        { name: 'Tinta Printer', qty: 20, condition: 'Good' }
    ]
  }
];

class SIA_Service {
  private suppliers: Supplier[] = [...MOCK_SUPPLIERS];
  private inventory: InventoryItem[] = [...MOCK_INVENTORY];
  private ppbbStore: PPbb[] = [...MOCK_PPBB];
  private sopbStore: SOPB[] = [...MOCK_SOPB];
  private sjStore: SuratJalan[] = [...MOCK_SJ];
  private fakturStore: Faktur[] = [];
  private jurnalStore: JurnalEntry[] = [];

  // Getters
  getSuppliers() { return this.suppliers; }
  getInventory() { return this.inventory; }
  getPPbbs() { return this.ppbbStore; }
  getSOPBs() { return this.sopbStore; }
  getSuratJalan() { return this.sjStore; }
  getFakturs() { return this.fakturStore; }
  getJurnal() { return this.jurnalStore; }

  // Supplier Management
  addSupplier(s: Supplier) {
    this.suppliers.push(s);
  }

  // Production: Create PPbb
  createPPbb(item: InventoryItem, qty: number) {
    const newReq: PPbb = {
      id: `REQ-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      qtyRequested: qty,
      requestDate: new Date().toISOString().split('T')[0],
      status: StatusDokumen.REQ_PENDING,
      requester: 'Produksi'
    };
    this.ppbbStore.push(newReq);
    return newReq;
  }

  // Purchasing: Create SOPB from PPbb
  createSOPB(ppbbId: string, vendorId: string, pricePerUnit: number) {
    const req = this.ppbbStore.find(r => r.id === ppbbId);
    const vendor = this.suppliers.find(v => v.id === vendorId);
    if (!req || !vendor) throw new Error("Invalid Request or Vendor");

    const newSOPB: SOPB = {
      id: `SOPB-${Date.now().toString().slice(-4)}`,
      ppbbId: req.id,
      vendorId: vendor.id,
      vendorName: vendor.name,
      items: [{ name: req.itemName, qty: req.qtyRequested, price: pricePerUnit }],
      totalAmount: req.qtyRequested * pricePerUnit,
      orderDate: new Date().toISOString().split('T')[0],
      status: StatusDokumen.TERKIRIM
    };

    req.status = StatusDokumen.REQ_APPROVED;
    this.sopbStore.push(newSOPB);
    
    // Simulate Vendor sending goods (Auto-create SJ for demo flow)
    this.simulateVendorDelivery(newSOPB);
    
    return newSOPB;
  }

  private simulateVendorDelivery(sopb: SOPB) {
    setTimeout(() => {
      const newSJ: SuratJalan = {
        id: `SJ-${Math.floor(Math.random() * 10000)}`,
        sopbId: sopb.id,
        vendorName: sopb.vendorName,
        deliveryDate: new Date().toISOString().split('T')[0],
        status: StatusDokumen.TERKIRIM,
        itemsReceived: sopb.items.map(i => ({ name: i.name, qty: i.qty, condition: 'Good' }))
      };
      this.sjStore.push(newSJ);
    }, 5000); // 5 seconds after SOPB, goods "arrive"
  }

  // Gudang: Verify
  verifyGoodsReceipt(sopbId: string, suratJalanId: string, isMatch: boolean): Promise<SuratJalan> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const sjIndex = this.sjStore.findIndex(sj => sj.id === suratJalanId);
        if (sjIndex === -1) return reject("Surat Jalan not found");

        if (isMatch) {
          const updatedSJ = {
            ...this.sjStore[sjIndex],
            status: StatusDokumen.DITERIMA,
            verifiedAt: new Date().toISOString()
          };
          this.sjStore[sjIndex] = updatedSJ;
          
          // Update Stock
          const sopb = this.sopbStore.find(s => s.id === sopbId);
          if (sopb && sopb.ppbbId) {
             const ppbb = this.ppbbStore.find(p => p.id === sopb.ppbbId);
             if (ppbb) {
               const itemIndex = this.inventory.findIndex(i => i.id === ppbb.itemId);
               if (itemIndex > -1) {
                 this.inventory[itemIndex].stock += ppbb.qtyRequested;
               }
             }
          }

          resolve(updatedSJ);
        } else {
            reject("Verification Failed: Goods do not match.");
        }
      }, 600);
    });
  }

  // Keuangan: Invoice
  processInvoice(request: InvoiceRequest): Promise<Faktur> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const sj = this.sjStore.find(s => s.id === request.suratJalanId);
        if (!sj) return reject("Related Surat Jalan not found");
        
        const newFaktur: Faktur = {
          id: request.fakturId,
          suratJalanId: request.suratJalanId,
          invoiceDate: new Date().toISOString(),
          dueDate: request.dueDate,
          totalAmount: request.totalAmount,
          status: 'UNPAID'
        };

        this.fakturStore.push(newFaktur);
        sj.status = StatusDokumen.DIPROSES;
        this.createJournalEntry(newFaktur, sj);

        resolve(newFaktur);
      }, 800);
    });
  }

  // Akuntansi
  private createJournalEntry(faktur: Faktur, sj: SuratJalan) {
    const newEntry: JurnalEntry = {
      id: `JRN-${Date.now()}`,
      date: new Date().toISOString(),
      description: `Pembelian Kredit - ${sj.vendorName} (Ref: ${faktur.id})`,
      fakturId: faktur.id,
      debit: [
        { account: '1140 - Persediaan Barang Dagang', amount: faktur.totalAmount }
      ],
      credit: [
        { account: '2110 - Utang Usaha', amount: faktur.totalAmount }
      ]
    };
    this.jurnalStore.push(newEntry);
  }
}

export const siaService = new SIA_Service();