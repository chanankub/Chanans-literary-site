import { defineCollection, z } from "astro:content";

const pairSchema = z
  .object({
    original: z.string().optional(),
    translation: z.string().optional(),
    spacer: z.boolean().optional(),
  })
  .refine(
    (p) => p.spacer === true || p.original || p.translation,
    { message: "Each pair needs original/translation or spacer: true" },
  );

const poems = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    originalTitle: z.string().optional(),
    author: z.string(),
    authorEn: z.string().optional(),
    authorBirth: z.number().optional(),
    authorDeath: z.number().optional(),
    sourceLang: z.string().default("en"),
    date: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    order: z.number().optional(),
    pairs: z.array(pairSchema).min(1),
  }),
});

const proseSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  date: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  order: z.number().optional(),
});

const stories = defineCollection({
  type: "content",
  schema: proseSchema,
});

const notes = defineCollection({
  type: "content",
  schema: proseSchema,
});

export const collections = { poems, stories, notes };
