import { Database, Tables } from "./types";

export type Entry = {
  id: string;
  created_at?: string;
  name?: string;
  quantity?: number;
  value?: number;
};

export type Category = { id: number; category: CategoryEnum };
export enum CategoryEnum {
  Food = "Food",
  Rent = "Rent",
  Subscription = "Subscription",
}

export type ReceiptToEntries = {
  entry_id: string;
  receipt_id: string;
};

export type TransactionWithCategory = Omit<
  Tables<"Transaction">,
  "category"
> & {
  category: { category: Tables<"Category">["category"] };
};
