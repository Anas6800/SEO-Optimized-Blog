"use client";

import { useMemo, useState } from "react";
import { NormalizedPost } from "@/types/wp";
import PostList from "@/components/PostList";

export default function SearchClient({ initialPosts }: { initialPosts: NormalizedPost[] }) {
	const [q, setQ] = useState("");
	const results = useMemo(() => {
		const query = q.trim().toLowerCase();
		if (!query) return initialPosts;
		return initialPosts.filter((p) =>
			[p.title, p.contentHtml].map((s) => s.toLowerCase()).some((s) => s.includes(query))
		);
	}, [q, initialPosts]);

	return (
		<div>
			<div className="card-surface p-3 mb-6">
				<input
					type="search"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					placeholder="Search posts..."
					className="w-full bg-transparent outline-none px-3 py-2"
				/>
			</div>
			<PostList posts={results} />
		</div>
	);
}


