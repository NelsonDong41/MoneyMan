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
  id: z.number().optional(),
  limit: z.number().min(0, "Limit must be positive"),
  category: z.string().min(1, "Category is required"),
  time_frame: z.enum(TIME_FRAME_OPTIONS),
});

export type CategorySpendLimitForm = z.infer<
  typeof categorySpendLimitFormSchema
>;
