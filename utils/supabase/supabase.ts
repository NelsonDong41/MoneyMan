import { Database, Tables } from "./types";

export type TransactionWithCategory = Omit<
  Tables<"transaction">,
  "category"
> & {
  category: { name: Tables<"category">["name"] };
};

export const STATUS_OPTIONS: Database["public"]["Enums"]["TransactionStatus"][] =
  ["Complete", "Pending", "Canceled"] as const;

export type Type = Database["public"]["Enums"]["TransactionType"];
export const TYPE_OPTIONS: Type[] = ["Expense", "Income"];

export type ColumnKeys = keyof TransactionWithCategory;
