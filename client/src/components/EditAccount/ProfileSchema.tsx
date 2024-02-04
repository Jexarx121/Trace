import { z } from "zod";

const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// include date of birth validator
const profileSchema = z.object({
  firstName: z.string().trim().min(1, { message: "Please enter a valid first name."}).max(25, { message: "First name can not be over 25 characters."}),
  surname: z.string().trim().min(1, { message: "Please enter a valid surname."}).max(25, { message: "Surname can not be over 25 characters."}),
  age: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().refine((value) => value >= 18 && value <= 110, {
    message: 'Age must be between 18 and 110 years old.',
  })),
  bio: z.string().trim().min(5, {message: "Please enter a valid bio of at least 5 characters."}).max(1000, {message: "Bio cannot be over 1000 characters"}),
  profileImage: z
    .any()
    .optional()
    .refine((files) => files?.length == 0 || (files[0]?.size <= MAX_FILE_SIZE && ACCEPTED_IMAGE_TYPES.includes(files[0]?.type)), 'Invalid file.')
});


export default profileSchema;