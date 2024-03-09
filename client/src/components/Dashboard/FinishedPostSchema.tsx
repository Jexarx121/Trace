import { z } from "zod";

const finishedPostSchema = z.object({
  amountPeople : z.string().min(1, {message: "Please enter a valid value."}).max(10, {message: "Please enter a valid value."}),
  time: z.string().min(1, {message: "Please enter a valid value."}).max(100, {message: "Please enter a valid value."}),
  rating: z.string().max(1, {message: "Please select a valid rating."})
});

export default finishedPostSchema;