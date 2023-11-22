import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email({message: "Invalid email."}).max(40, {message: "Must be less than 40 characters"}),
  firstName: z.string().min(2, {message: "Must be 2 or more characters long."}).max(30, {message: "Must be less than 30 characters"}),
  surname: z.string().min(2, {message: "Must be 2 or more characters long."}).max(30, {message: "Must be less than 30 characters"}),
  dateOfBirth: z.date(),
  password: z.string()
    .min(8, {message: "Must be 8 or more characters long."})
    .refine((password) => /\d/.test(password), {message: 'Must contain at least 1 number.',})
}).required();

export default RegisterSchema;
