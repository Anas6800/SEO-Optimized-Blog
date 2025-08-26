import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			// Disallow Next internals
			disallow: ["/api/", "/_next/"],
		},
		sitemap: siteUrl ? `${siteUrl}/sitemap.xml` : undefined,
		host: siteUrl || undefined,
	};
}


