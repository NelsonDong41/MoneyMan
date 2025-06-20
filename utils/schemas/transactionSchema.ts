import { z } from "zod";

export const TRANSACTION_STATUS = ["Complete", "Pending", "Canceled"];
export const TRANSACTION_TYPE = ["Expense", "Income"];

export const transactionSchema = z.object({
  id: z.string().min(1, "Id is required"),
  userId: z.string().min(1, "UserId is required"),
  description: z.string().min(1, "Description is required"),
  merchant: z.string().min(1, "Merchant is required"),
  category: z.string().min(1, "Category is required"),
  status: z.string().refine(
    (val) => TRANSACTION_STATUS.includes(val),
    "Status must be 'Complete', 'Pending', or 'Canceled'"
  ),
  type: z.string().refine(
    (val) => TRANSACTION_TYPE.includes(val),
    "Type must be 'Expense' or 'Income'"
  ),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  subtotal: z
    .string()
    .optional()
    .refine((val) => !isNaN(Number(val)), {
      message: "Subtotal must be a number",
    }),
  tax: z
    .string()
    .optional()
    .refine((val) => !isNaN(Number(val)), { message: "Tax must be a number" }),
  tip: z
    .string()
    .optional()
    .refine((val) => !isNaN(Number(val)), { message: "Tip must be a number" }),
  amount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Total must be a number",
  }),
  notes: z.string().optional(),
  image: z.any().optional(),
  created_at: z
    .string()
    .optional()
    .refine((val) => !val || (val && !isNaN(Date.parse(val))), {
      message: "Invalid date format for created_at",
    }),
  updated_at: z
    .string()
    .optional()
    .refine((val) => !val || (val && !isNaN(Date.parse(val))), {
      message: "Invalid date format for updated_at",
    }),
});

export type Transaction = z.infer<typeof transactionSchema>;
