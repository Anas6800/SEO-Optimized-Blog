import Image from "next/image";
import Link from "next/link";
import { NormalizedPost } from "@/types/wp";

export default function PostCard({ post }: { post: NormalizedPost }) {
	return (
		<article className="card-surface overflow-hidden flex flex-col hover:shadow transition">
			{post.featuredImageUrl ? (
				<Link href={`/blog/${post.slug}`} className="block relative aspect-[16/9]">
					<Image src={post.featuredImageUrl} alt={post.title} fill className="object-cover" />
				</Link>
			) : null}
			<div className="p-4 flex flex-col gap-2">
				<h3 className="text-lg font-semibold leading-tight text-white">
					<Link href={`/blog/${post.slug}`}>{post.title}</Link>
				</h3>
				<p className="text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: post.excerptHtml }} />
				{post.categories?.length ? (
					<ul className="mt-1 flex flex-wrap gap-2">
						{post.categories.slice(0, 3).map((c) => (
							<li key={c.id}>
								<Link href={`/category/${c.slug}`} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
									{c.name}
								</Link>
							</li>
						))}
					</ul>
				) : null}
				<div className="text-xs text-gray-400">{post.dateDisplay}</div>
			</div>
		</article>
	);
}


