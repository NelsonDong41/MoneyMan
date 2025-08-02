import { z } from "zod";

export const MAX_FILE_SIZE = 500000;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const imageFileSchema = z
  .instanceof(File)
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "Only .jpeg, .jpg, .png, .webp and .pdf files are allowed.",
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: `Max file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
  });

export const imagesSchema = z.array(imageFileSchema);

export const imagesFormSchema = z.object({
  imagesToAdd: imagesSchema.optional(),
  imagesToDelete: z.array(z.string()).optional(),
});
