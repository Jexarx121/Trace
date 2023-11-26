import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email({message: "Invalid email."}).max(40, {message: "Must be less than 40 characters"}),
  firstName: z.string().min(2, {message: "Must be 2 or more characters long."}).max(30, {message: "Must be less than 30 characters"}),
  surname: z.string().min(2, {message: "Must be 2 or more characters long."}).max(30, {message: "Must be less than 30 characters"}),
  age: z.number().int({message: 'Must be a number'}).min(18, {message: "You must be at least 18 years old"})
    .max(120, {message: "A valid age must be entered"}),
  password: z.string()
    .min(8, {message: "Must be 8 or more characters long."})
    .refine((password) => /\d/.test(password), {message: 'Must contain at least 1 number.',})
}).required();

export default RegisterSchema;
