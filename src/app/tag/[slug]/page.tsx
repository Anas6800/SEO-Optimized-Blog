import { getPosts } from "@/lib/wp";
import PostList from "@/components/PostList";
import { getTags } from "@/lib/wp";

export default async function TagPage({ params }: { params: { slug: string } }) {
	const tags = await getTags();
	const tag = tags.find((t) => t.slug === params.slug);
	let posts = [] as Awaited<ReturnType<typeof getPosts>>["posts"];
	if (tag) {
		const res = await getPosts({ page: 1, perPage: 12 });
		posts = res.posts.filter((p) => p.tags.some((t) => t.id === tag.id));
	}
	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
			<h1 className="text-3xl font-bold mb-6">Tag: {params.slug}</h1>
			<PostList posts={posts} />
		</div>
	);
}


