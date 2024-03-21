import { z } from "zod";

const postSchema = z.object({
  title: z.string().trim().min(5, {message: "Titles cannot be shorter than 5 characters."}).max(100, {message: "Titles cannot be over 100 characters."}),
  type: z.string().min(1, {message: "Please select an option."}),
  description: z.string().min(10, {message: "Description cannot be shorter than 10 characters."}).max(500, {message: "Description cannot be over 500 characters long."}),
  contact: z.string().min(8, {message: "Please enter a valid form of contact."}).max(20, {message: "Please enter a valid form of contact."})
});

export default postSchema;