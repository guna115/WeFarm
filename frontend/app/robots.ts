import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/seller/dashboard', '/seller/add-post', '/seller/profile'],
    },
    sitemap: 'https://wefarm.live/sitemap.xml',
  };
}
