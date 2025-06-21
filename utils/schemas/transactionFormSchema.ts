import { z } from "zod";

// Replace with your actual enum values from Supabase
const transactionStatusEnum = ["Pending", "Complete", "Canceled"] as const;
const transactionTypeEnum = ["Income", "Expense"] as const;

export const transactionFormSchema = z.object({
  id: z.number().optional().nullable(),
  amount: z
    .string()
    .regex(
      /^(\d{1,3}(,\d{3})*|\d+)(\.\d{2})?$/,
      "Must be a valid currency format (e.g., 1,234.56)"
    ),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  merchant: z.string().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(transactionStatusEnum),
  subtotal: z
    .string()
    .regex(
      /^(\d{1,3}(,\d{3})*|\d+)(\.\d{2})?$/,
      "Must be a valid currency format (e.g., 1,234.56)"
    )
    .nullable()
    .optional(),
  tax: z
    .string()
    .regex(
      /^(\d{1,3}(,\d{3})*|\d+)(\.\d{2})?$/,
      "Must be a valid currency format (e.g., 1,234.56)"
    )
    .nullable()
    .optional(),
  tip: z
    .string()
    .regex(
      /^(\d{1,3}(,\d{3})*|\d+)(\.\d{2})?$/,
      "Must be a valid currency format (e.g., 1,234.56)"
    )
    .nullable()
    .optional(),
  type: z.enum(transactionTypeEnum),
  updated_at: z.string().nullable().optional(),
});

export type FormTransaction = z.infer<typeof transactionFormSchema>;
