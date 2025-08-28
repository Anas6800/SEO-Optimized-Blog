import { getAllPostSlugs, getPostBySlug } from "@/lib/wp";
import ShareButtons from "@/components/ShareButtons";
import SchemaArticle from "@/components/SchemaArticle";
import type { Metadata } from "next";
import Image from "next/image";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const post = await getPostBySlug(params.slug);
	const title = post ? `${post.title} | SEO Blog` : "Post | SEO Blog";
	const description = post ? post.excerptHtml.replace(/<[^>]+>/g, "").slice(0, 160) : "Blog post";
	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images: post?.featuredImageUrl ? [{ url: post.featuredImageUrl }] : undefined,
			type: "article",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: post?.featuredImageUrl ? [post.featuredImageUrl] : undefined,
		},
	};
}

export default async function BlogPostPage({ params }: Props) {
	const post = await getPostBySlug(params.slug);
	if (!post) return <div className="max-w-3xl mx-auto py-12">Not found.</div>;
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
	const url = siteUrl ? `${siteUrl}/blog/${post.slug}` : `/${post.slug}`;
	
	// Debug logging for image URL
	if (post.featuredImageUrl) {
		console.log('Featured image URL:', post.featuredImageUrl);
		console.log('Post data:', {
			title: post.title,
			slug: post.slug,
			hasImage: !!post.featuredImageUrl,
			imageUrl: post.featuredImageUrl
		});
	} else {
		console.log('No featured image found for post:', post.slug);
	}
	
	return (
		<div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
			<article className="prose prose-invert prose-slate max-w-none">
				<h1 className="mb-6">{post.title}</h1>
				<div className="text-sm text-gray-500 mb-6">
					{post.dateDisplay} {post.authorName ? `• ${post.authorName}` : null}
				</div>
				{post.featuredImageUrl ? (
					<div className="w-full mb-8 overflow-hidden rounded-lg">
						<div className="relative aspect-[16/9] w-full">
							<Image 
								src={post.featuredImageUrl} 
								alt={post.title} 
								fill 
								className="object-cover" 
								priority
								onError={(e) => {
									console.error('Image failed to load:', post.featuredImageUrl);
								}}
								onLoad={() => {
									console.log('Image loaded successfully:', post.featuredImageUrl);
								}}
							/>
						</div>
						{/* Debug info - remove in production */}
						<div className="text-xs text-gray-500 mt-2">
							Debug: {post.featuredImageUrl}
						</div>
					</div>
				) : (
					<div className="w-full mb-8 p-8 bg-gray-800 rounded-lg text-center text-gray-400">
						No featured image available
						<div className="text-xs mt-2">
							Debug: Check WordPress backend for featured image
						</div>
					</div>
				)}
				<div 
					className="prose prose-invert prose-slate max-w-none"
					dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
				/>
				<div className="mt-8">
					<ShareButtons url={url || `/${params.slug}`} title={post.title} />
				</div>
			</article>
			<SchemaArticle
				title={post.title}
				description={post.excerptHtml.replace(/<[^>]+>/g, "").slice(0, 160)}
				url={url}
				image={post.featuredImageUrl}
				author={post.authorName}
				datePublished={post.date}
			/>
			{post.tags.length ? (
				<div className="mt-8 text-sm text-gray-600">
					<strong>Tags:</strong> {post.tags.map((t) => t.name).join(", ")}
				</div>
			) : null}
		</div>
	);
}

export async function generateStaticParams() {
	const slugs = await getAllPostSlugs(5, 50);
	return slugs.map((slug) => ({ slug }));
}

// Faster revalidation for development and better content freshness
export const revalidate = 60; // Revalidate every 1 minute instead of 5 minutes

// Force dynamic rendering for better content updates
export const dynamic = 'force-dynamic';


