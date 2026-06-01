import { MetadataRoute } from 'next';
import { categories } from '@/components/ui/CategoryFilter';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://wefarm.live';

  const categoryUrls = categories.filter(c => c.id !== 'all').map((cat) => ({
    url: `${baseUrl}/plants/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/buyer`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/seller/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...categoryUrls,
  ];
}
