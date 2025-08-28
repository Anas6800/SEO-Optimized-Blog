import Image from "next/image";
import Link from "next/link";
import { NormalizedPost } from "@/types/wp";

export default function PostCard({ post }: { post: NormalizedPost }) {
	// Function to strip HTML tags and truncate text
	const truncateText = (html: string, maxLength: number = 120) => {
		const text = html.replace(/<[^>]+>/g, '').trim();
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength).trim() + '...';
	};

	// Function to truncate title if too long
	const truncateTitle = (title: string, maxLength: number = 60) => {
		if (title.length <= maxLength) return title;
		return title.substring(0, maxLength).trim() + '...';
	};

	return (
		<article className="card-surface overflow-hidden flex flex-col hover:shadow transition h-full">
			{post.featuredImageUrl ? (
				<Link href={`/blog/${post.slug}`} className="block relative aspect-[16/9] flex-shrink-0">
					<Image 
						src={post.featuredImageUrl} 
						alt={post.title} 
						fill 
						className="object-cover" 
					/>
				</Link>
			) : null}
			
			<div className="p-4 flex flex-col gap-3 flex-1">
				<h3 className="text-lg font-semibold leading-tight text-white line-clamp-2 min-h-[3rem] flex items-start">
					<Link href={`/blog/${post.slug}`} className="hover:text-indigo-300 transition-colors">
						{truncateTitle(post.title)}
					</Link>
				</h3>
				
				<p className="text-sm text-gray-300 line-clamp-3 min-h-[4.5rem] flex-grow">
					{truncateText(post.excerptHtml)}
				</p>
				
				<div className="mt-auto space-y-3">
					{post.categories?.length ? (
						<ul className="flex flex-wrap gap-2">
							{post.categories.slice(0, 3).map((c) => (
								<li key={c.id}>
									<Link 
										href={`/category/${c.slug}`} 
										className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-500/30 hover:border-indigo-400/50 transition-colors"
									>
										{c.name}
									</Link>
								</li>
							))}
						</ul>
					) : null}
					
					<div className="text-xs text-gray-400 pt-2 border-t border-white/10">
						{post.dateDisplay}
					</div>
				</div>
			</div>
		</article>
	);
}


