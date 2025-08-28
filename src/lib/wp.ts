import { NormalizedPost, WPCategory, WPPost, WPTag, WPMedia } from "@/types/wp";

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
	
	// Get the most recent image URL (WordPress sometimes caches old URLs)
	let imageUrl = media?.source_url; // This is usually the most current
	
	// Fallback to different sizes if source_url is not available
	if (!imageUrl) {
		imageUrl = media?.media_details?.sizes?.large?.source_url ||
			media?.media_details?.sizes?.medium?.source_url ||
			media?.media_details?.sizes?.thumbnail?.source_url;
	}
	
	if (!imageUrl) {
		console.warn('No image URL found for post:', post.id);
		return undefined;
	}
	
	// If the URL is relative, make it absolute
	if (!imageUrl.startsWith('http')) {
		imageUrl = `${process.env.NEXT_PUBLIC_WP_API_BASE?.replace(/\/$/, "")}${imageUrl}`;
	}
	
	// Add cache busting parameter to force fresh image loading
	// This helps when WordPress replaces images but keeps old URLs
	// Use post modified date for better cache busting
	const postModified = new Date(post.modified).getTime();
	const separator = imageUrl.includes('?') ? '&' : '?';
	imageUrl = `${imageUrl}${separator}_v=${postModified}`;
	
	console.log('Generated image URL with version-based cache busting:', imageUrl);
	
	return imageUrl;
}

// Function to get a fresh image URL without caching
export async function getFreshImageUrl(mediaId: number): Promise<string | undefined> {
	try {
		const media = await wpFetch<WPMedia>(`/media/${mediaId}`);
		if (!media?.source_url) return undefined;
		
		let imageUrl = media.source_url;
		
		// If the URL is relative, make it absolute
		if (!imageUrl.startsWith('http')) {
			imageUrl = `${process.env.NEXT_PUBLIC_WP_API_BASE?.replace(/\/$/, "")}${imageUrl}`;
		}
		
		// Add timestamp for immediate cache busting
		const separator = imageUrl.includes('?') ? '&' : '?';
		const timestamp = Date.now();
		imageUrl = `${imageUrl}${separator}_fresh=${timestamp}`;
		
		return imageUrl;
	} catch (error) {
		console.error('Error fetching fresh image URL:', error);
		return undefined;
	}
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
	try {
		const query = new URLSearchParams({ slug, _embed: "1" });
		console.log('Fetching post with slug:', slug);
		console.log('API URL:', `${API_BASE}/wp-json/wp/v2/posts?${query.toString()}`);
		
		const posts = await wpFetch<WPPost[]>(`/posts?${query.toString()}`);
		console.log('Posts found:', posts.length);
		
		const first = posts[0];
		if (first) {
			const normalized = normalizePost(first);
			console.log('Normalized post:', {
				title: normalized.title,
				hasImage: !!normalized.featuredImageUrl,
				imageUrl: normalized.featuredImageUrl
			});
			return normalized;
		}
		
		console.log('No post found with slug:', slug);
		return null;
	} catch (error) {
		console.error('Error fetching post by slug:', slug, error);
		return null;
	}
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


