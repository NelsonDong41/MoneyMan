import { z } from "zod";

// Replace with your actual enum values from Supabase
const transactionStatusEnum = ["Pending", "Complete", "Canceled"] as const;
const transactionTypeEnum = ["Income", "Expense"] as const;

export const transactionFormSchema = z.object({
  amount: z.number().min(0, "Amount is required"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  merchant: z.string().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(transactionStatusEnum),
  subtotal: z.number().nullable().optional(),
  tax: z.number().nullable().optional(),
  tip: z.number().nullable().optional(),
  type: z.enum(transactionTypeEnum),
  updated_at: z.string().nullable().optional(),
});

export type FormTransaction = z.infer<typeof transactionFormSchema>;
