export interface Vendor {
  id: number;
  slug: string;
  businessName: string;
  balance: number;
  phone?: string;
  logo?: string; // Base64 logo
  passwordHash?: string;
}

export interface Product {
  id: number;
  vendorId: number;
  name: string;
  price: number;
  image?: string; // Base64 image
}

export interface Order {
  id: number;
  vendorId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productName: string;
  quantity: number;
  totalPaid: number;
  paystackFeePaid: number;
  commissionPaid: number;
  paymentReference: string;
  date: string;
}

export interface DashboardData {
  vendor: Vendor;
  products: Product[];
  orders: Order[];
}
