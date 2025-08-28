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
	
	if (!post) {
		return (
			<div className="max-w-3xl mx-auto py-12 px-4">
				<h1 className="text-2xl font-bold text-red-500">Post not found</h1>
				<p>Could not find post with slug: {params.slug}</p>
			</div>
		);
	}
	
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
	const url = siteUrl ? `${siteUrl}/blog/${post.slug}` : `/${post.slug}`;
	
	return (
		<div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
			<article className="prose prose-invert prose-slate max-w-none">
				<h1 className="mb-6">{post.title}</h1>
				<div className="text-sm text-gray-500 mb-6">
					{post.dateDisplay} {post.authorName ? `• ${post.authorName}` : null}
				</div>
				
				{post.featuredImageUrl && (
					<div className="w-full mb-8 overflow-hidden rounded-lg">
						<div className="relative aspect-[16/9] w-full">
							<Image 
								src={post.featuredImageUrl} 
								alt={post.title} 
								fill 
								className="object-cover" 
								priority
							/>
						</div>
					</div>
				)}
				
				<div 
					className="prose prose-invert prose-slate max-w-none"
					dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
				/>
				
				<div className="mt-8">
					<ShareButtons url={url} title={post.title} />
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
			
			{post.tags && post.tags.length > 0 && (
				<div className="mt-8 text-sm text-gray-600">
					<strong>Tags:</strong> {post.tags.map((t) => t.name).join(", ")}
				</div>
			)}
		</div>
	);
}

export async function generateStaticParams() {
	try {
		const slugs = await getAllPostSlugs(5, 50);
		return slugs.map((slug) => ({ slug }));
	} catch (error) {
		console.error('Error generating static params:', error);
		return [];
	}
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';


