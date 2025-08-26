import type { MetadataRoute } from "next";
import { getAllPostSlugs, getCategories, getTags } from "@/lib/wp";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
	const urls: MetadataRoute.Sitemap = [];
	if (siteUrl) {
		urls.push({ url: siteUrl, lastModified: new Date() });
	}
	const [slugs, categories, tags] = await Promise.all([
		getAllPostSlugs(3, 100),
		getCategories(),
		getTags(),
	]);
	for (const slug of slugs) {
		if (siteUrl) urls.push({ url: `${siteUrl}/blog/${slug}`, lastModified: new Date() });
	}
	for (const c of categories) {
		if (siteUrl) urls.push({ url: `${siteUrl}/category/${c.slug}`, lastModified: new Date() });
	}
	for (const t of tags) {
		if (siteUrl) urls.push({ url: `${siteUrl}/tag/${t.slug}`, lastModified: new Date() });
	}
	return urls;
}


