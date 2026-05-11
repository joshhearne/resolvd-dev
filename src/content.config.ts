import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    tag: z.string().optional(),
    publishDate: z.coerce.date(),
    summary: z.string(),
    featured: z.boolean().default(true),
    icon: z.string().default("🚀"),
    pillLabel: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const docs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    version: z.string(),
    order: z.number().default(100),
    summary: z.string().optional(),
    since: z.string().optional(),
  }),
});

export const collections = { blog, docs };
