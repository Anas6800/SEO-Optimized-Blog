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
		<article className="glass-card overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 h-full group float-animation hover:scale-[1.02]">
			{post.featuredImageUrl ? (
				<Link href={`/blog/${post.slug}`} className="block relative aspect-[16/9] flex-shrink-0 overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
					<Image 
						src={post.featuredImageUrl} 
						alt={post.title} 
						fill 
						className="object-cover group-hover:scale-110 transition-transform duration-700" 
					/>
					<div className="absolute bottom-3 left-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
						<div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30">
							📖 Read More
						</div>
					</div>
				</Link>
			) : null}
			
			<div className="p-6 flex flex-col gap-4 flex-1 relative">
				{/* Decorative accent line */}
				<div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
				
				<h3 className="text-xl font-bold leading-tight text-white line-clamp-2 min-h-[3.5rem] flex items-start group-hover:text-indigo-300 transition-colors duration-300">
					<Link href={`/blog/${post.slug}`} className="hover:text-indigo-300 transition-colors">
						{truncateTitle(post.title)}
					</Link>
				</h3>
				
				<p className="text-sm text-gray-300 line-clamp-3 min-h-[4.5rem] flex-grow leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
					{truncateText(post.excerptHtml)}
				</p>
				
				<div className="mt-auto space-y-4">
					{post.categories?.length ? (
						<ul className="flex flex-wrap gap-2">
							{post.categories.slice(0, 3).map((c) => (
								<li key={c.id}>
									<Link 
										href={`/category/${c.slug}`} 
										className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-200 border border-indigo-400/30 hover:from-indigo-500/30 hover:to-purple-500/30 hover:border-indigo-300/50 transition-all duration-300 hover:scale-105"
									>
										{c.name}
									</Link>
								</li>
							))}
						</ul>
					) : null}
					
					<div className="flex items-center justify-between pt-3 border-t border-white/10">
						<div className="text-xs text-gray-400 flex items-center gap-2">
							<span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
							{post.dateDisplay}
						</div>
						<div className="text-xs text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							→
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}


