import { NormalizedPost, WPCategory, WPPost, WPTag, WPMedia } from "@/types/wp";

const API_BASE = process.env.NEXT_PUBLIC_WP_API_BASE?.replace(/\/$/, "") ?? "";


if (!API_BASE) {
	console.warn(
		"NEXT_PUBLIC_WP_API_BASE is not set. Set it to your WordPress site base, e.g., https://example.com"
	);
}

async function wpFetch<T>(path: string, init?: RequestInit): Promise<{ data: T; headers: Headers }> {
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
	return { data: (await res.json()) as T, headers: res.headers };
}

// Simple version of wpFetch that only returns data for backward compatibility
async function wpFetchData<T>(path: string, init?: RequestInit): Promise<T> {
	const result = await wpFetch<T>(path, init);
	return result.data;
}

function pickFeaturedImageUrl(post: WPPost): string | undefined {
	try {
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
		
		// If still no URL, try to get from media ID directly
		if (!imageUrl && media?.id) {
			// This is a fallback - we'll handle this in the getFreshImageUrl function
			return undefined;
		}
		
		if (!imageUrl) {
			console.warn(`No image URL found for post ${post.id}, media:`, media);
			return undefined;
		}
		
		// If the URL is relative, make it absolute
		if (!imageUrl.startsWith('http')) {
			imageUrl = `${process.env.NEXT_PUBLIC_WP_API_BASE?.replace(/\/$/, "")}${imageUrl}`;
		}
		
		// Only add cache busting if the image URL doesn't already have query parameters
		// This prevents conflicts with WordPress's own query parameters
		if (!imageUrl.includes('?')) {
			const postModified = new Date(post.modified).getTime();
			// Use both post ID and modified time for unique cache busting
			imageUrl = `${imageUrl}?v=${post.id}_${postModified}`;
		}
		
		return imageUrl;
	} catch (error) {
		console.error(`Error processing image for post ${post.id}:`, error);
		return undefined;
	}
}

// Function to get a fresh image URL without caching
export async function getFreshImageUrl(postId: number): Promise<string | undefined> {
	try {
		// First get the post to find the featured media ID
		const post = await wpFetchData<WPPost>(`/posts/${postId}?_embed=1`);
		if (!post?._embedded?.["wp:featuredmedia"]?.[0]) return undefined;
		
		const mediaId = post._embedded["wp:featuredmedia"][0].id;
		
		// Try to fetch the media directly
		let media;
		try {
			media = await wpFetchData<WPMedia>(`/media/${mediaId}`);
		} catch (mediaError) {
			console.warn(`Media ${mediaId} not found, may have been deleted:`, mediaError);
			return undefined;
		}
		
		if (!media?.source_url) {
			console.warn(`Media ${mediaId} has no source_url`);
			return undefined;
		}
		
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

// Function to safely get image URL with fallbacks
export async function getSafeImageUrl(post: WPPost): Promise<string | undefined> {
	try {
		// First try the embedded media
		let imageUrl = pickFeaturedImageUrl(post);
		
		// If that fails, try to fetch fresh
		if (!imageUrl && post._embedded?.["wp:featuredmedia"]?.[0]?.id) {
			imageUrl = await getFreshImageUrl(post.id);
		}
		
		// If still no image, return undefined (will show placeholder)
		return imageUrl;
	} catch (error) {
		console.error(`Error getting safe image URL for post ${post.id}:`, error);
		return undefined;
	}
}

function normalizePost(post: WPPost): NormalizedPost {
	try {
		const allTerms = post._embedded?.["wp:term"] ?? [];
		const categories = (allTerms[0] as WPCategory[] | undefined) ?? [];
		const tags = (allTerms[1] as WPTag[] | undefined) ?? [];
		
		// Format date in a stable, locale-agnostic way on the server
		const d = new Date(post.date);
		const dateDisplay = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
		
		// Get image URL with better error handling
		let featuredImageUrl: string | undefined;
		try {
			featuredImageUrl = pickFeaturedImageUrl(post);
		} catch (imageError) {
			console.warn(`Error getting image for post ${post.id}:`, imageError);
			featuredImageUrl = undefined;
		}
		
		return {
			id: post.id,
			slug: post.slug,
			title: post.title.rendered,
			excerptHtml: post.excerpt.rendered,
			contentHtml: post.content.rendered,
			date: post.date,
			dateDisplay,
			authorName: post._embedded?.author?.[0]?.name,
			featuredImageUrl,
			categories,
			tags,
		};
	} catch (error) {
		console.error(`Error normalizing post ${post.id}:`, error);
		// Return a minimal post object to prevent complete failure
		return {
			id: post.id,
			slug: post.slug,
			title: post.title?.rendered || 'Untitled',
			excerptHtml: post.excerpt?.rendered || '',
			contentHtml: post.content?.rendered || '',
			date: post.date || new Date().toISOString(),
			dateDisplay: new Date().toISOString().split('T')[0],
			authorName: post._embedded?.author?.[0]?.name,
			featuredImageUrl: undefined,
			categories: [],
			tags: [],
		};
	}
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
	
	// Use wpFetch to get both data and headers
	const result = await wpFetch<WPPost[]>(`/posts?${query.toString()}`);
	const posts = result.data;
	
	// Get pagination info from headers if available
	const total = parseInt(result.headers.get('X-WP-Total') || posts.length.toString());
	const totalPages = parseInt(result.headers.get('X-WP-TotalPages') || Math.ceil(total / (params?.perPage || 10)).toString());
	
	return { posts: posts.map(normalizePost), total, totalPages };
}

export async function getPostBySlug(slug: string): Promise<NormalizedPost | null> {
	try {
		const query = new URLSearchParams({ slug, _embed: "1" });
		
		const posts = await wpFetchData<WPPost[]>(`/posts?${query.toString()}`);
		
		const first = posts[0];
		if (first) {
			const normalized = normalizePost(first);
			return normalized;
		}
		
		return null;
	} catch (error) {
		console.error('Error fetching post by slug:', slug, error);
		return null;
	}
}

export async function getCategories(): Promise<WPCategory[]> {
	if (!API_BASE) return [];
	return await wpFetchData<WPCategory[]>("/categories?per_page=100");
}

export async function getTags(): Promise<WPTag[]> {
	if (!API_BASE) return [];
	return await wpFetchData<WPTag[]>("/tags?per_page=100");
}

export async function getPostsByCategorySlug(slug: string, page = 1, perPage = 10) {
	const categories = await wpFetchData<WPCategory[]>(`/categories?slug=${encodeURIComponent(slug)}`);
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

// Function to handle WordPress media deletion gracefully
export async function handleMediaDeletion(postId: number): Promise<void> {
	try {
		// This function can be called when a post is deleted to clean up any orphaned media references
		console.log(`Handling media cleanup for deleted post ${postId}`);
		
		// In a real implementation, you might want to:
		// 1. Check if the media is still used by other posts
		// 2. Clean up any orphaned media references
		// 3. Update the cache to reflect changes
		
	} catch (error) {
		console.error(`Error handling media deletion for post ${postId}:`, error);
	}
}

// Function to get posts with resilient image handling
export async function getPostsWithResilientImages(params?: {
	page?: number;
	perPage?: number;
	category?: number;
}): Promise<{
	posts: NormalizedPost[];
	total: number;
	totalPages: number;
}> {
	try {
		if (!API_BASE) {
			return { posts: [], total: 0, totalPages: 0 };
		}
		
		const query = new URLSearchParams({ _embed: "1" });
		if (params?.page) query.set("page", String(params.page));
		if (params?.perPage) query.set("per_page", String(params.perPage));
		if (params?.category) query.set("categories", String(params.category));
		
		// Use wpFetch to get both data and headers
		const result = await wpFetch<WPPost[]>(`/posts?${query.toString()}`);
		const posts = result.data;
		
		// Process posts with resilient image handling
		const normalizedPosts = posts.map(post => {
			try {
				return normalizePost(post);
			} catch (error) {
				console.error(`Error normalizing post ${post.id}:`, error);
				// Return a minimal post object to prevent complete failure
				return {
					id: post.id,
					slug: post.slug,
					title: post.title?.rendered || 'Untitled',
					excerptHtml: post.excerpt?.rendered || '',
					contentHtml: post.content?.rendered || '',
					date: post.date || new Date().toISOString(),
					dateDisplay: new Date().toISOString().split('T')[0],
					authorName: post._embedded?.author?.[0]?.name,
					featuredImageUrl: undefined,
					categories: [],
					tags: [],
				};
			}
		});
		
		// Get pagination info
		const total = posts.length > 0 ? posts.length : 0;
		const totalPages = params?.page ? Math.ceil(total / (params.perPage || 10)) : 1;
		
		return { posts: normalizedPosts, total, totalPages };
	} catch (error) {
		console.error('Error fetching posts with resilient images:', error);
		return { posts: [], total: 0, totalPages: 0 };
	}
}


