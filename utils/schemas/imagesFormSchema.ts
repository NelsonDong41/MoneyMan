import { z } from "zod";

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

export const imagesFormSchema = z.object({
  images: imagesSchema,
});
