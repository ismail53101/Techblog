import { z } from "zod";

export const RoleEnum = z.enum(["ADMIN", "EDITOR", "AUTHOR"]);
export const PostStatusEnum = z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]);

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

const slugField = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only");

export const postSchema = z.object({
  title: z.string().min(3, "Title is too short").max(160, "Title is too long"),
  slug: slugField.optional(),
  excerpt: z.string().min(10, "Excerpt is too short").max(320, "Excerpt is too long"),
  content: z.string().min(1, "Content is required"),
  coverImage: z.union([z.string().url(), z.literal("")]).nullish(),
  coverImageAlt: z.string().max(200).optional().nullable(),
  categoryId: z.string().min(1, "Choose a category"),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  status: PostStatusEnum.default("DRAFT"),
  featured: z.boolean().default(false),
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
  publishedAt: z.coerce.date().nullish(),
});
export type PostInput = z.infer<typeof postSchema>;

export const categorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: slugField.optional(),
  description: z.string().max(300).optional().nullable(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const tagSchema = z.object({
  name: z.string().min(1).max(40),
  slug: slugField.optional(),
});
export type TagInput = z.infer<typeof tagSchema>;

export const userCreateSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  role: RoleEnum.default("AUTHOR"),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.union([z.string().url(), z.literal("")]).nullish(),
  twitter: z.string().max(40).optional().nullable(),
  github: z.string().max(40).optional().nullable(),
  website: z.union([z.string().url(), z.literal("")]).nullish(),
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = userCreateSchema.partial().extend({
  password: z.string().min(8).max(200).optional().or(z.literal("")),
});
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email("Enter a valid email"),
  subject: z.string().max(150).optional().nullable(),
  message: z.string().min(10, "Message is too short").max(5000),
});
export type ContactInput = z.infer<typeof contactSchema>;
