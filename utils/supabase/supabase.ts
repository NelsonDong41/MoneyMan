export type Entry = {
  id: string;
  created_at?: string;
  name?: string;
  quantity?: number;
  value?: number;
};

export enum Category {
  Food = "FOOD",
  Rent = "Rent",
  Subscription = "Subscription",
}

export type Receipt = {
  id: string;
  created_at: string;
  merchant: string;
  receipt: string;
  notes?: string;
  date?: string;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  user_id?: string;
  category: { category: Category };
};

export type ReceiptToEntries = {
  entry_id: string;
  receipt_id: string;
};
