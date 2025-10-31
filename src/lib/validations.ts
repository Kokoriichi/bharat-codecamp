import { z } from 'zod';

// Auth validations
export const signUpSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  fullName: z.string()
    .trim()
    .min(1, { message: "Full name is required" })
    .max(100, { message: "Full name must be less than 100 characters" }),
});

export const signInSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z.string()
    .min(1, { message: "Password is required" })
    .max(100, { message: "Password must be less than 100 characters" }),
});

// Notes validations
export const noteSchema = z.object({
  title: z.string()
    .trim()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title must be less than 100 characters" }),
  content: z.string()
    .trim()
    .max(50000, { message: "Content must be less than 50,000 characters" })
    .optional(),
});

// Editor validations
export const fileNodeSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(255, { message: "Name must be less than 255 characters" })
    .regex(/^[a-zA-Z0-9._-]+$/, { message: "Name can only contain letters, numbers, dots, hyphens, and underscores" }),
  content: z.string()
    .max(100000, { message: "File content must be less than 100,000 characters" })
    .optional(),
});

export const projectSchema = z.object({
  title: z.string()
    .trim()
    .min(1, { message: "Project title is required" })
    .max(100, { message: "Project title must be less than 100 characters" }),
  code: z.string()
    .max(100000, { message: "Code must be less than 100,000 characters" }),
});
