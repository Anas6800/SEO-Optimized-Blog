import Link from "next/link";

export default function Navbar() {
	return (
		<header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/60 backdrop-blur supports-[backdrop-filter]:bg-slate-900/40">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
				<Link href="/" className="text-xl font-semibold tracking-tight text-white">SEO Blog</Link>
				<nav className="flex items-center gap-2">
					<Link href="/" className="btn-outline">Home</Link>
					<Link href="/search" className="btn-outline">Search</Link>
				</nav>
			</div>
		</header>
	);
}

