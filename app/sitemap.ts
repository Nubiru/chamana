import { getModelos } from '@/lib/payload/queries';
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://chamana-ashy.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const modelos = await getModelos();
  const productPages = modelos.map((model) => ({
    url: `${BASE_URL}/producto/${model.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/tienda`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/desfile`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...productPages,
  ];
}
