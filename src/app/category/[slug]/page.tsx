import { getPostsByCategorySlug } from "@/lib/wp";
import PostList from "@/components/PostList";
import Pagination from "@/components/Pagination";

export default async function CategoryPage({ params, searchParams }: { params: { slug: string }, searchParams: { page?: string } }) {
	const page = Number(searchParams?.page ?? "1");
	const perPage = 12;
	const { posts, totalPages } = await getPostsByCategorySlug(params.slug, page, perPage);
	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
			<h1 className="text-3xl font-bold tracking-tight mb-2">Category: {params.slug}</h1>
			<p className="text-muted mb-6">Articles curated under this category.</p>
			<PostList posts={posts} />
			<Pagination basePath={`/category/${params.slug}`} page={page} totalPages={totalPages} />
		</div>
	);
}


