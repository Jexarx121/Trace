import { z } from "zod";

const finishedPostSchema = z.object({
  time: z
    .string()
    .min(1, { message: "Please enter a valid value." })
    .max(3, { message: "Amount of hours cannot exceed 200." })
    .refine(value => {
      const parsedValue = parseInt(value);
      return parsedValue > 0 && parsedValue <= 200;
    }, { message: "Amount of hours must be between 1 and 200." }
  ),
  amountPeople: z
    .string()
    .min(1, { message: "Please enter a valid value." })
    .max(2, { message: "Amount of people cannot exceed 10." })
    .refine(value => {
      const parsedValue = parseInt(value);
      return parsedValue > 0 && parsedValue <= 10;
    }, { message: "Amount of people must be between 1 and 10." }
  ),
  rating: z.string().max(1, {message: "Please select a valid rating."})
});

export default finishedPostSchema;