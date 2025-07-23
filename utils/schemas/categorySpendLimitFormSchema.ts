import { z } from "zod";
import { Tables } from "../supabase/types";

export const TIME_FRAME_OPTIONS = [
  "Yearly",
  "Monthly",
  "Weekly",
  "Daily",
] as const;
export type TimeFrame = (typeof TIME_FRAME_OPTIONS)[number];

// Replace with your actual enum values from Supabase
export const categorySpendLimitFormSchema = z.object({
  id: z.number().optional().nullable(),
  limit: z
    .string()
    .regex(
      /^(\d{1,3}(,\d{3})*|\d+)(\.\d{2})?$/,
      "Must be a valid currency format (e.g., 1,234.56) or empty"
    ),
  category: z.string().min(1, "Category is required"),
  timeFrame: z.enum(TIME_FRAME_OPTIONS),
});

export type CategorySpendLimitForm = z.infer<
  typeof categorySpendLimitFormSchema
>;
