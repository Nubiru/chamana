import { SITE_URL } from '@/lib/config';
import { getModelos } from '@/lib/payload/queries';
import type { MetadataRoute } from 'next';

// Use build date as the baseline — updated on each deploy
const LAST_DEPLOY = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const modelos = await getModelos();
  const productPages = modelos.map((model) => ({
    url: `${SITE_URL}/producto/${model.slug}`,
    lastModified: LAST_DEPLOY,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: LAST_DEPLOY,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tienda`,
      lastModified: LAST_DEPLOY,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/desfile`,
      lastModified: LAST_DEPLOY,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...productPages,
  ];
}
