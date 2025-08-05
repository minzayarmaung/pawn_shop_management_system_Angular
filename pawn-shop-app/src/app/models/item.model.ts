export interface Item {
  id?: number;
  type: string; // e.g., "Phone", "Motorbike"
  brand: string;
  model: string;
  imei?: string; // for phones
  description: string;
}
