import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email({message: "Invalid email."}),
  firstName: z.string().min(2, {message: "Must be 2 or more characters long."}),
  surname: z.string().min(2, {message: "Must be 2 or more characters long."}),
  password: z.string()
    .min(8, {message: "Must be 8 or more characters long."})
    .refine((password) => /\d/.test(password), {message: 'Must contain at least 1 number.',})
}).required();

export default RegisterSchema;
