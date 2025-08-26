export default function Footer() {
	return (
		<footer className="border-t border-white/10 bg-slate-900/60">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-sm text-gray-300 flex items-center justify-between">
				<p>
					© {new Date().getFullYear()} SEO Blog. All rights reserved.
				</p>
				<p>
					Built with Next.js + WordPress
				</p>
			</div>
		</footer>
	);
}
