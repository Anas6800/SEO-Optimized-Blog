import { getPostsWithResilientImages } from "@/lib/wp";
import SearchClient from "@/components/SearchClient";

export default async function SearchPage() {
	try {
		// Use the resilient function that handles deleted posts gracefully
		const { posts } = await getPostsWithResilientImages({ page: 1, perPage: 100 });
		
		// Filter out any posts that might be invalid or have critical errors
		const validPosts = posts.filter(post => 
			post.title && 
			post.title !== 'Untitled' && 
			post.slug && 
			post.contentHtml
		);
		
		return (
			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
				<h1 className="text-2xl font-bold tracking-tight mb-2">Search the blog</h1>
				<p className="text-muted mb-6">Find articles by title or content. Results update as you type.</p>
				<SearchClient initialPosts={validPosts} />
			</div>
		);
	} catch (error) {
		console.error('Error loading search page:', error);
		return (
			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
				<h1 className="text-2xl font-bold tracking-tight mb-2">Search the blog</h1>
				<p className="text-muted mb-6">Find articles by title or content. Results update as you type.</p>
				<div className="card-surface p-6 text-center">
					<p className="text-gray-400">Unable to load posts at the moment. Please try again later.</p>
				</div>
			</div>
		);
	}
}


