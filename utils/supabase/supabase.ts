export type Entry = {
  id: String;
  created_at?: String;
  name?: String;
  quantity?: Number;
  value?: Number;
};

export type Receipt = {
  id: String;
  created_at: String;
  merchant: String;
  receipt: String;
  notes?: String;
  date?: String;
  subtotal: Number;
  tax: Number;
  tip: Number;
  total: Number;
  user_id?: String;
};

export type ReceiptToEntries = {
  entry_id: String;
  receipt_id: String;
};
