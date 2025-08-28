"use client";

import { useMemo, useState } from "react";
import { NormalizedPost } from "@/types/wp";
import PostList from "@/components/PostList";

export default function SearchClient({ initialPosts }: { initialPosts: NormalizedPost[] }) {
	const [q, setQ] = useState("");
	
	const results = useMemo(() => {
		const query = q.trim().toLowerCase();
		if (!query) {
			// When no query, show all valid posts
			return initialPosts.filter(post => 
				post.title && 
				post.title !== 'Untitled' && 
				post.slug && 
				post.contentHtml &&
				post.contentHtml.length > 0
			);
		}
		
		// Filter posts based on search query and validity
		return initialPosts.filter((post) => {
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
	}, [q, initialPosts]);

	// Show message if no results found
	const noResultsMessage = q.trim() && results.length === 0 && (
		<div className="card-surface p-6 text-center">
			<p className="text-gray-400">No posts found matching &ldquo;{q}&rdquo;. Try a different search term.</p>
		</div>
	);

	return (
		<div>
			<div className="card-surface p-3 mb-6">
				<input
					type="search"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					placeholder="Search posts..."
					className="w-full bg-transparent outline-none px-3 py-2"
				/>
			</div>
			
			{noResultsMessage}
			
			{results.length > 0 && (
				<div>
					<p className="text-sm text-gray-400 mb-4">
						Found {results.length} post{results.length !== 1 ? 's' : ''}
						{q.trim() && ` matching "${q}"`}
					</p>
					<PostList posts={results} />
				</div>
			)}
		</div>
	);
}


