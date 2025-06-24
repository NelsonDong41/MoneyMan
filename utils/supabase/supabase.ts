import { Database, Tables } from "./types";

export type TransactionWithCategory = Omit<
  Tables<"Transaction">,
  "category"
> & {
  category: { category: Tables<"Category">["category"] };
};

export const STATUS_OPTIONS: Database["public"]["Enums"]["TransactionStatus"][] =
  ["Complete", "Pending", "Canceled"] as const;
export const TYPE_OPTIONS: Database["public"]["Enums"]["TransactionType"][] = [
  "Expense",
  "Income",
];
