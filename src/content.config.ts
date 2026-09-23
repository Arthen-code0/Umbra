import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const diario = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/diario' }),
  schema: z.object({
    titulo: z.string(),
    resumen: z.string(),
    fechaPublicacion: z.coerce.date(),
    autor: z.string(),
    categoria: z.enum(['Astrofotografía', 'Guías de observación', 'El observatorio']),
  }),
});

export const collections = { diario };
