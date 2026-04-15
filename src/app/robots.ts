import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], // Запрещаем роботам сканировать наши скрытые API и вебхуки
    },
    sitemap: 'https://nizhnikivan.ru/sitemap.xml',
  };
}