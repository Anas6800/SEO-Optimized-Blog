import { NormalizedPost, WPCategory, WPPost, WPTag } from "@/types/wp";

const API_BASE = process.env.NEXT_PUBLIC_WP_API_BASE?.replace(/\/$/, "") ?? "";


if (!API_BASE) {
	console.warn(
		"NEXT_PUBLIC_WP_API_BASE is not set. Set it to your WordPress site base, e.g., https://example.com"
	);
}

async function wpFetch<T>(path: string, init?: RequestInit): Promise<T> {
	if (!API_BASE) {
		throw new Error(
			"NEXT_PUBLIC_WP_API_BASE is not set. Set it to your WordPress site base URL (e.g., https://example.com)"
		);
	}
	const url = `${API_BASE}/wp-json/wp/v2${path}`;
	const res = await fetch(url, {
		...init,
		headers: {
			Accept: "application/json",
			...(init?.headers ?? {}),
		},
		// Use default caching for WordPress API calls to ensure images load properly
		// The revalidation will handle content freshness
	});
	if (!res.ok) {
		throw new Error(`WordPress API error ${res.status} for ${path}`);
	}
	const contentType = res.headers.get("content-type") || "";
	if (!contentType.includes("application/json")) {
		const text = await res.text();
		throw new Error(
			`Expected JSON but received '${contentType}'. URL: ${url}. Body starts with: ${text.slice(0, 120)}`
		);
	}
	return (await res.json()) as T;
}

function pickFeaturedImageUrl(post: WPPost): string | undefined {
	const media = post._embedded?.["wp:featuredmedia"]?.[0];
	if (!media) return undefined;
	
	// Ensure we get the full URL for the image
	const imageUrl = media?.media_details?.sizes?.large?.source_url ||
		media?.media_details?.sizes?.medium?.source_url ||
		media?.source_url;
	
	// If the URL is relative, make it absolute
	if (imageUrl && !imageUrl.startsWith('http')) {
		return `${process.env.NEXT_PUBLIC_WP_API_BASE?.replace(/\/$/, "")}${imageUrl}`;
	}
	
	return imageUrl;
}

function normalizePost(post: WPPost): NormalizedPost {
	const allTerms = post._embedded?.["wp:term"] ?? [];
	const categories = (allTerms[0] as WPCategory[] | undefined) ?? [];
	const tags = (allTerms[1] as WPTag[] | undefined) ?? [];
	// Format date in a stable, locale-agnostic way on the server
	const d = new Date(post.date);
	const dateDisplay = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
	return {
		id: post.id,
		slug: post.slug,
		title: post.title.rendered,
		excerptHtml: post.excerpt.rendered,
		contentHtml: post.content.rendered,
		date: post.date,
		dateDisplay,
		authorName: post._embedded?.author?.[0]?.name,
		featuredImageUrl: pickFeaturedImageUrl(post),
		categories,
		tags,
	};
}

export async function getPosts(params?: {
	page?: number;
	perPage?: number;
	category?: number;
}): Promise<{
	posts: NormalizedPost[];
	total: number;
	totalPages: number;
}> {
	if (!API_BASE) {
		return { posts: [], total: 0, totalPages: 0 };
	}
	const query = new URLSearchParams({ _embed: "1" });
	if (params?.page) query.set("page", String(params.page));
	if (params?.perPage) query.set("per_page", String(params.perPage));
	if (params?.category) query.set("categories", String(params.category));
	
	// Use wpFetch for consistency and proper error handling
	const posts = await wpFetch<WPPost[]>(`/posts?${query.toString()}`);
	
	// Get pagination info from headers if available
	const total = posts.length > 0 ? posts.length : 0;
	const totalPages = params?.page ? Math.ceil(total / (params.perPage || 10)) : 1;
	
	return { posts: posts.map(normalizePost), total, totalPages };
}

export async function getPostBySlug(slug: string): Promise<NormalizedPost | null> {
	const query = new URLSearchParams({ slug, _embed: "1" });
	const posts = await wpFetch<WPPost[]>(`/posts?${query.toString()}`);
	const first = posts[0];
	return first ? normalizePost(first) : null;
}

export async function getCategories(): Promise<WPCategory[]> {
	if (!API_BASE) return [];
	return await wpFetch<WPCategory[]>("/categories?per_page=100");
}

export async function getTags(): Promise<WPTag[]> {
	if (!API_BASE) return [];
	return await wpFetch<WPTag[]>("/tags?per_page=100");
}

export async function getPostsByCategorySlug(slug: string, page = 1, perPage = 10) {
	const categories = await wpFetch<WPCategory[]>(`/categories?slug=${encodeURIComponent(slug)}`);
	const cat = categories[0];
	if (!cat) return { posts: [], total: 0, totalPages: 0 };
	return await getPosts({ category: cat.id, page, perPage });
}

export async function getAllPostSlugs(maxPages = 10, perPage = 100): Promise<string[]> {
	// Paginate to collect slugs for SSG. Limit to avoid huge builds.
	if (!API_BASE) return [];
	const slugs: string[] = [];
	let page = 1;
	while (page <= maxPages) {
		const { posts, totalPages } = await getPosts({ page, perPage });
		slugs.push(...posts.map((p) => p.slug));
		if (page >= totalPages) break;
		page += 1;
	}
	return Array.from(new Set(slugs));
}


