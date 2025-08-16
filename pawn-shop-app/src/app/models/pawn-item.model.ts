export interface PawnItem {
  id: string; // Make optional for creation
  customerId: any;
  customerName: string;
  customerPhone: string; // Add this
  customerAddress: string; // Add this
  customerNrc: string;
  category: string;
  amount: number;
  pawnId: any;
  pawnDate: string;
  dueDate: string;
  voucherCode: any;
  status: 'Active' | 'Expired' | 'Redeemed' | 'Inactive'; // Make optional for creation
  description: string;
  [key: string]: any; // This allows dynamic properties
  
  // Phone specific properties
  brand?: string;
  model?: string;
  imei?: string;
  storage?: string;
  condition?: string;
  
  // MotoBike specific properties
  make?: string;
  year?: number;
  engine?: string;
  plateNumber?: string;
  mileage?: number;
  
  // Bicycle specific properties
  type?: string;
  frameSize?: string;
  gears?: number;
  wheelSize?: string;
  
  // Watch specific properties
  watchBrand?: string;
  watchModel?: string;
  movement?: string;
  material?: string;
  serialNumber?: string;
  
  // Others
  itemName?: string;
  weight?: number;
  material2?: string;
  color?: string;
}