import { getPosts } from "@/lib/wp";
import PostList from "@/components/PostList";
import { getTags } from "@/lib/wp";

export default async function TagPage({ params }: { params: { slug: string } }) {
	try {
		const tags = await getTags();
		const tag = tags.find((t) => t.slug === params.slug);
		
		if (!tag) {
			return (
				<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
					<h1 className="text-3xl font-bold mb-6 text-red-500">Tag not found</h1>
					<p>Could not find tag: {params.slug}</p>
				</div>
			);
		}
		
		// Fetch posts and filter by tag
		const res = await getPosts({ page: 1, perPage: 100 }); // Fetch more posts to ensure we get tagged ones
		const posts = res.posts.filter((p) => p.tags.some((t) => t.id === tag.id));
		
		return (
			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
				<h1 className="text-3xl font-bold mb-6">Tag: {tag.name}</h1>
				{posts.length > 0 ? (
					<PostList posts={posts} />
				) : (
					<p className="text-gray-500">No posts found with this tag.</p>
				)}
			</div>
		);
	} catch {
		return (
			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
				<h1 className="text-3xl font-bold mb-6 text-red-500">Error</h1>
				<p>Failed to load tag page.</p>
			</div>
		);
	}
}


