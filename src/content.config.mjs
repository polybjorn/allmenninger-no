import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One entry per language. The page is a single scrolling document, so the
// sections live in one file rather than one file each: the cards, the timeline
// and the gallery are short structured fields, and only the Om section is
// flowing prose, which is the markdown body.
const photo = z.object({ src: z.string(), alt: z.string() });

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Set on any language that has not been read by a native speaker.
    machineTranslated: z.boolean().default(false),
    hero: z.object({
      eyebrow: z.string(),
      heading: z.string(),
      lead: z.string(),
      caption: z.string(),
      image: photo,
      actions: z.array(z.object({ label: z.string(), href: z.string() })),
    }),
    services: z.object({
      kicker: z.string(),
      heading: z.string(),
      intro: z.string(),
      items: z.array(z.object({
        num: z.string(),
        title: z.string(),
        lead: z.string(),
        points: z.array(z.string()),
        // Card 02 has no photograph on the original site, only an icon.
        image: photo.optional(),
      })),
    }),
    about: z.object({
      kicker: z.string(),
      heading: z.string(),
      image: photo,
      facts: z.array(z.object({ title: z.string(), body: z.string() })),
    }),
    projects: z.object({
      kicker: z.string(),
      heading: z.string(),
      intro: z.string(),
      items: z.array(z.object({
        year: z.string(),
        title: z.string(),
        body: z.string(),
      })),
    }),
    gallery: z.object({
      kicker: z.string(),
      heading: z.string(),
      intro: z.string(),
      items: z.array(z.object({
        image: photo,
        caption: z.string(),
        tall: z.boolean().default(false),
      })),
    }),
    contact: z.object({
      heading: z.string(),
      body: z.string(),
      email: z.string(),
    }),
  }),
});

export const collections = { pages };
