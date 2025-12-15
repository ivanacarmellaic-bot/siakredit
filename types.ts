export enum Role {
  DASHBOARD = 'DASHBOARD',
  PRODUKSI = 'PRODUKSI',
  PEMBELIAN = 'PEMBELIAN',
  GUDANG = 'GUDANG',
  KEUANGAN = 'KEUANGAN',
  AKUNTANSI = 'AKUNTANSI',
  SUPPLIER = 'SUPPLIER'
}

export enum StatusDokumen {
  DRAFT = 'DRAFT',
  TERKIRIM = 'TERKIRIM', // Sent to Vendor
  DITERIMA = 'DITERIMA', // Verified by Gudang
  DIPROSES = 'DIPROSES', // Invoiced by Keuangan
  SELESAI = 'SELESAI',
  REQ_PENDING = 'PENDING', // PPbb Pending
  REQ_APPROVED = 'APPROVED' // PPbb converted to SOPB
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  contact: string;
  email: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  safetyStock: number;
  unit: string;
  lastPrice: number;
}

// Permintaan Pembelian (Purchase Requisition)
export interface PPbb {
  id: string;
  itemId: string;
  itemName: string;
  qtyRequested: number;
  requestDate: string;
  status: StatusDokumen; // REQ_PENDING or REQ_APPROVED
  requester: string; // e.g., 'Produksi'
}

// Surat Order Pembelian
export interface SOPB {
  id: string;
  ppbbId?: string; // Linked Request
  vendorId: string;
  vendorName: string;
  items: { name: string; qty: number; price: number }[];
  totalAmount: number;
  orderDate: string;
  status: StatusDokumen;
}

// Surat Jalan (Delivery Note)
export interface SuratJalan {
  id: string;
  sopbId: string;
  vendorName: string; // Denormalized for display
  deliveryDate: string;
  status: StatusDokumen;
  verifiedAt?: string;
  itemsReceived: { name: string; qty: number; condition: 'Good' | 'Damaged' }[];
}

// Faktur (Invoice)
export interface Faktur {
  id: string;
  suratJalanId: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  status: 'UNPAID' | 'PAID';
}

// Jurnal Akuntansi
export interface JurnalEntry {
  id: string;
  date: string;
  description: string;
  fakturId: string;
  debit: { account: string; amount: number }[];
  credit: { account: string; amount: number }[];
}

export interface VerificationRequest {
  sopbId: string;
  suratJalanId: string;
  isMatch: boolean;
}

export interface InvoiceRequest {
  fakturId: string; // The ID supplied by vendor
  suratJalanId: string;
  dueDate: string;
  totalAmount: number;
}