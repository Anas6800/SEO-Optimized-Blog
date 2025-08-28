"use client";

import { useMemo, useState, useCallback } from "react";
import { NormalizedPost } from "@/types/wp";
import PostList from "@/components/PostList";

export default function SearchClient({ initialPosts }: { initialPosts: NormalizedPost[] }) {
	const [q, setQ] = useState("");
	const [posts] = useState(initialPosts);
	const [isRefreshing, setIsRefreshing] = useState(false);
	
	// Function to refresh posts data
	const refreshPosts = useCallback(async () => {
		setIsRefreshing(true);
		try {
			// Force a page refresh to get fresh data
			window.location.reload();
		} catch (error) {
			console.error('Error refreshing posts:', error);
		} finally {
			setIsRefreshing(false);
		}
	}, []);
	
	const results = useMemo(() => {
		const query = q.trim().toLowerCase();
		if (!query) {
			// When no query, show all valid posts
			return posts.filter(post => 
				post.title && 
				post.title !== 'Untitled' && 
				post.slug && 
				post.contentHtml &&
				post.contentHtml.length > 0
			);
		}
		
		// Filter posts based on search query and validity
		return posts.filter((post) => {
			// First check if post is valid
			if (!post.title || post.title === 'Untitled' || !post.slug || !post.contentHtml) {
				return false;
			}
			
			// Then check if it matches the search query
			const titleMatch = post.title.toLowerCase().includes(query);
			const contentMatch = post.contentHtml.toLowerCase().includes(query);
			const excerptMatch = post.excerptHtml?.toLowerCase().includes(query) || false;
			
			return titleMatch || contentMatch || excerptMatch;
		});
	}, [q, posts]);

	return (
		<div>
			{/* Enhanced search input with refresh button */}
			<div className="relative mb-8">
				<div className="card-surface p-4">
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
				<input
					type="search"
					value={q}
					onChange={(e) => setQ(e.target.value)}
							placeholder="Search posts by title, content, or excerpt..."
							className="w-full bg-transparent outline-none pl-10 pr-20 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 border-transparent rounded-lg transition-all duration-200"
							autoFocus
						/>
						{/* Refresh button */}
						<button
							onClick={refreshPosts}
							disabled={isRefreshing}
							className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
							title="Refresh posts data"
						>
							<svg className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						</button>
						{q && (
							<button
								onClick={() => setQ('')}
								className="absolute inset-y-0 right-12 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
								aria-label="Clear search"
							>
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Search results summary */}
			{q.trim() && (
				<div className="mb-6">
					<div className="flex items-center justify-between">
						<p className="text-sm text-gray-400">
							{results.length === 0 
								? `No results found for "${q.trim()}"`
								: `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${q.trim()}"`
							}
						</p>
						{results.length > 0 && (
							<button
								onClick={() => setQ('')}
								className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
							>
								Clear search
							</button>
						)}
					</div>
				</div>
			)}

			{/* No results message */}
			{q.trim() && results.length === 0 && (
				<div className="card-surface p-8 text-center">
					<div className="text-gray-400 mb-4">
						<svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<h3 className="text-lg font-medium text-white mb-2">No posts found</h3>
					<p className="text-gray-400 mb-4">
						No posts match your search for &ldquo;<span className="text-white">{q.trim()}</span>&rdquo;.
					</p>
					<div className="text-sm text-gray-500">
						<p className="mb-2">Try searching for:</p>
						<ul className="space-y-1">
							<li>• Different keywords or phrases</li>
							<li>• More general terms</li>
							<li>• Check your spelling</li>
						</ul>
					</div>
			</div>
			)}

			{/* Search results */}
			{results.length > 0 && (
				<div className="space-y-6">
			<PostList posts={results} />
					
					{/* Show all posts hint when no search query */}
					{!q.trim() && (
						<div className="card-surface p-4 text-center border-dashed">
							<p className="text-sm text-gray-400">
								💡 <strong>Tip:</strong> Start typing above to search through all {results.length} posts
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}


