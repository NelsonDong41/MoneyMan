import { z } from "zod";

const transactionStatusEnum = ["Pending", "Complete", "Canceled"] as const;
const transactionTypeEnum = ["Income", "Expense"] as const;
const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const imageFileSchema = z
  .instanceof(File)
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "Only .jpeg, .jpg, .png, .webp files are allowed.",
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: `Max file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
  });

export const imagesSchema = z.array(imageFileSchema).optional();

export const transactionFormSchema = z.object({
  id: z.number().optional().nullable(),
  amount: z
    .string()
    .regex(
      /^(\d{1,3}(,\d{3})*|\d+)(\.\d{2})?$/,
      "Must be a valid currency format (e.g., 1,234.56) or empty"
    ),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  merchant: z.string().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(transactionStatusEnum),
  subtotal: z
    .union([
      z.literal(""),
      z
        .string()
        .regex(
          /^(\d{1,3}(,\d{3})*|\d+)(\.\d{2})?$/,
          "Must be a valid currency format (e.g., 1,234.56) or empty"
        ),
      z.null(),
    ])
    .optional(),
  tax: z
    .union([
      z.literal(""),
      z
        .string()
        .regex(
          /^(\d{1,3}(,\d{3})*|\d+)(\.\d{2})?$/,
          "Must be a valid currency format (e.g., 1,234.56) or empty"
        ),
      z.null(),
    ])
    .optional(),
  tip: z
    .union([
      z.literal(""),
      z
        .string()
        .regex(
          /^(\d{1,3}(,\d{3})*|\d+)(\.\d{2})?$/,
          "Must be a valid currency format (e.g., 1,234.56) or empty"
        ),
      z.null(),
    ])
    .optional(),
  type: z.enum(transactionTypeEnum),
  images: imagesSchema,
});

export type FormTransaction = z.infer<typeof transactionFormSchema>;
