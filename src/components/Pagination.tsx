import Link from "next/link";

export default function Pagination({ basePath, page, totalPages }: { basePath: string; page: number; totalPages: number }) {
	if (totalPages <= 1) return null;

	const getPageUrl = (pageNum: number) => {
		if (pageNum === 1) return basePath;
		return `${basePath}?page=${pageNum}`;
	};

	const getVisiblePages = () => {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
			range.push(i);
		}

		if (page - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (page + delta < totalPages - 1) {
			rangeWithDots.push('...', totalPages);
		} else if (totalPages > 1) {
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	};

	return (
		<div className="flex items-center justify-center gap-2">
			{page > 1 && (
				<Link
					href={getPageUrl(page - 1)}
					className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					Previous
				</Link>
			)}

			<div className="flex items-center gap-1">
				{getVisiblePages().map((pageNum, index) => (
					<span key={index}>
						{pageNum === '...' ? (
							<span className="px-3 py-2 text-gray-400">...</span>
						) : (
							<Link
								href={getPageUrl(pageNum as number)}
								className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
									pageNum === page
										? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-110'
										: 'bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:scale-105 hover:shadow-md'
								}`}
							>
								{pageNum}
							</Link>
						)}
					</span>
				))}
			</div>

			{page < totalPages && (
				<Link
					href={getPageUrl(page + 1)}
					className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
				>
					Next
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
					</svg>
				</Link>
			)}
		</div>
	);
}
