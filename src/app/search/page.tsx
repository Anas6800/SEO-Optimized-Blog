import { getPostsWithResilientImages } from "@/lib/wp";
import SearchClient from "@/components/SearchClient";
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Search Posts',
	description: 'Search through all blog posts by title, content, or excerpt. Find exactly what you\'re looking for.',
	openGraph: {
		title: 'Search Posts | SEO Blog',
		description: 'Search through all blog posts by title, content, or excerpt.',
		type: 'website',
	},
};

export default async function SearchPage() {
	try {
		// Use the resilient function that handles deleted posts gracefully
		const { posts } = await getPostsWithResilientImages({ page: 1, perPage: 100 });
		
		// Filter out any posts that might be invalid, deleted, or have critical errors
		const validPosts = posts.filter(post => {
			// Must have all required fields
			if (!post.title || !post.slug || !post.contentHtml) {
				return false;
			}
			
			// Must not be placeholder/error posts
			if (post.title === 'Untitled' || post.title === 'Post') {
				return false;
			}
			
			// Must have meaningful content
			if (post.contentHtml.length < 10) {
				return false;
			}
			
			// Must have a valid slug (not empty or just numbers)
			if (!post.slug || post.slug.length < 3) {
				return false;
			}
			
			return true;
		});
		
		return (
			<div>
				{/* Hero Section */}
				<section className="border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900 text-white">
					<div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
						<div className="text-center">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-6">
								<svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							<h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Search the Blog</h1>
							<p className="text-lg text-gray-300 max-w-2xl mx-auto mb-2">
								Discover articles, insights, and stories from our collection of {validPosts.length} posts.
							</p>
							<p className="text-sm text-gray-400">
								Search by title, content, or excerpt • Results update instantly
							</p>
						</div>
					</div>
				</section>

				{/* Search Content */}
				<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
					<SearchClient initialPosts={validPosts} />
				</div>
			</div>
		);
	} catch (error) {
		console.error('Error loading search page:', error);
		return (
			<div>
				<section className="border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900 text-white">
					<div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
						<div className="text-center">
							<h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Search the Blog</h1>
							<p className="text-lg text-gray-300 max-w-2xl mx-auto">
								Unable to load posts at the moment. Please try again later.
							</p>
						</div>
					</div>
				</section>
				<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
					<div className="card-surface p-6 text-center">
						<p className="text-gray-400">Unable to load posts at the moment. Please try again later.</p>
					</div>
				</div>
			</div>
		);
	}
}


