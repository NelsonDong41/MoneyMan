import { z } from "zod";
import { transactionFormSchema } from "./transactionFormSchema";
import { imagesFormSchema } from "./imagesFormSchema";

export const tableSheetFormSchema = z.object({
  ...transactionFormSchema.shape,
  ...imagesFormSchema.shape,
});

export type TableSheetForm = z.infer<typeof tableSheetFormSchema>;
