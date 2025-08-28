import Link from "next/link";

export default function Navbar() {
	return (
		<header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-900/40">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
				<Link href="/" className="text-2xl font-bold tracking-tight text-white hover:text-indigo-300 transition-colors duration-300">
					<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
						SEO Blog
					</span>
				</Link>
				<nav className="flex items-center gap-3">
					<Link href="/" className="btn-outline">
						<span>🏠</span>
						<span>Home</span>
					</Link>
					<Link href="/search" className="btn-outline bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
						<span>🔍</span>
						<span>Search</span>
					</Link>
				</nav>
			</div>
		</header>
	);
}


