export default function Loading() {
	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
			<div className="animate-pulse space-y-4">
				<div className="h-8 w-1/3 bg-gray-200 rounded" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="h-64 bg-gray-200 rounded" />
					))}
				</div>
			</div>
		</div>
	);
}


