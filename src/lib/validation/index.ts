import * as z from "zod";

export const SignUpValidation = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" }),
  username: z
    .string({ required_error: "Username is required" })
    .min(2, { message: "Username must be at least 2 characters" }),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" }),
  password: z.string({ required_error: "Password is required" }).min(8, {
    message: "Password must be at least 8 characters",
  }),
});

export const SignInValidation = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" }),
  password: z.string({ required_error: "Password is required" }).min(8, {
    message: "Password must be at least 8 characters",
  }),
});

export const PostValidation = z.object({
  caption: z
    .string()
    .min(5, { message: "Caption must be at least 5 characters" })
    .max(2200),
  file: z.custom<File[]>(),
  location: z.string().min(2).max(100),
  tags: z.string(),
});
