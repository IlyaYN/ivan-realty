import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nizhnikivan.ru';
  
  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/services`, lastModified: new Date() },
    { url: `${baseUrl}/media`, lastModified: new Date() },
    { url: `${baseUrl}/contacts`, lastModified: new Date() },
  ];
}
