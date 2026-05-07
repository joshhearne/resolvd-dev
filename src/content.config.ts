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

export const collections = { blog };
