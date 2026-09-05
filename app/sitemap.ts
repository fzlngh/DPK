import type { MetadataRoute } from "next";
const SITE_URL = "https://dhiyaa-fazila.my.id";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/portofolio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}