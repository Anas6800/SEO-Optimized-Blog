import PostCard from "@/components/PostCard";
import { NormalizedPost } from "@/types/wp";

export default function PostList({ posts }: { posts: NormalizedPost[] }) {
	if (!posts.length) return <p className="text-gray-300">No posts found.</p>;
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{posts.map((p) => (
				<PostCard key={p.id} post={p} />
			))}
		</div>
	);
}


