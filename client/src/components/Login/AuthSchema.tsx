import { z } from "zod";

const authSchema = z.object({
  email: z.string().email().min(4, {message: "Please enter a valid email."}),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message:
        "Password must contain at least 1 lowercase letter, 1 uppercase letter, and 1 number.",
    }),
});

export default authSchema;