import { getPosts } from "@/lib/wp";
import SearchClient from "@/components/SearchClient";

export default async function SearchPage() {
	const { posts } = await getPosts({ page: 1, perPage: 100 });
	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
			<h1 className="text-2xl font-bold tracking-tight mb-2">Search the blog</h1>
			<p className="text-muted mb-6">Find articles by title or content. Results update as you type.</p>
			<SearchClient initialPosts={posts} />
		</div>
	);
}


