import Link from "next/link";

export default function Pagination({
	basePath,
	page,
	totalPages,
}: {
	basePath: string;
	page: number;
	totalPages: number;
}) {
	if (totalPages <= 1) return null;
	const prev = page > 1 ? page - 1 : null;
	const next = page < totalPages ? page + 1 : null;
	return (
		<nav className="mt-8 flex items-center justify-between text-sm">
			<div>
				{prev ? (
					<Link className="px-3 py-2 rounded border hover:bg-gray-100" href={`${basePath}?page=${prev}`}>
						← Previous
					</Link>
				) : (
					<span className="px-3 py-2 text-gray-400">← Previous</span>
				)}
			</div>
			<div className="text-gray-600">
				Page {page} of {totalPages}
			</div>
			<div>
				{next ? (
					<Link className="px-3 py-2 rounded border hover:bg-gray-100" href={`${basePath}?page=${next}`}>
						Next →
					</Link>
				) : (
					<span className="px-3 py-2 text-gray-400">Next →</span>
				)}
			</div>
		</nav>
	);
}
