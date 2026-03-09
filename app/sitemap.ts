import { getModelos } from '@/lib/payload/queries';
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://chamana.app';

// Use build date as the baseline — updated on each deploy
const LAST_DEPLOY = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const modelos = await getModelos();
  const productPages = modelos.map((model) => ({
    url: `${BASE_URL}/producto/${model.slug}`,
    lastModified: LAST_DEPLOY,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: LAST_DEPLOY,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/tienda`,
      lastModified: LAST_DEPLOY,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/desfile`,
      lastModified: LAST_DEPLOY,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...productPages,
  ];
}
