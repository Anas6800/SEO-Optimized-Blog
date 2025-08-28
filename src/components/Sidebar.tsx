import Link from "next/link";
import { getCategories } from "@/lib/wp";

export default async function Sidebar() {
	const categories = await getCategories();
	return (
		<aside className="space-y-6">
			<div className="glass-card p-6">
				<h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
					<span className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full" />
					Categories
				</h2>
				<ul className="space-y-2">
					{categories.map((c) => (
						<li key={c.id}>
							<Link 
								className="flex items-center justify-between p-3 rounded-xl text-indigo-200 hover:text-white hover:bg-white/5 transition-all duration-300 group" 
								href={`/category/${c.slug}`}
							>
								<span className="font-medium">{c.name}</span>
								<span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-indigo-400">
									→
								</span>
							</Link>
						</li>
					))}
				</ul>
			</div>

			<div className="glass-card p-6">
				<h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
					<span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
					Quick Actions
				</h2>
				<div className="space-y-3">
					<Link 
						href="/search" 
						className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 group"
					>
						<span className="text-lg">🔍</span>
						<span>Search Posts</span>
						<span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-indigo-400">
							→
						</span>
					</Link>
					<Link 
						href="/" 
						className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 group"
					>
						<span className="text-lg">🏠</span>
						<span>Home</span>
						<span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-indigo-400">
							→
						</span>
					</Link>
				</div>
			</div>

			<div className="glass-card p-6">
				<h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
					<span className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" />
					About
				</h2>
				<p className="text-sm text-gray-300 leading-relaxed">
					Discover insights, stories, and updates from our team. We share knowledge about technology, development, and digital innovation.
				</p>
			</div>
		</aside>
	);
}


