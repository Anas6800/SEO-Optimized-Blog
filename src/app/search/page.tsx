"use client";

import { useEffect, useMemo, useState } from "react";
import { NormalizedPost } from "@/types/wp";
import PostList from "@/components/PostList";

export default function SearchPage() {
	const [q, setQ] = useState("");
	const [data, setData] = useState<NormalizedPost[]>([]);

	useEffect(() => {
		const controller = new AbortController();
		const API_BASE = (process.env.NEXT_PUBLIC_WP_API_BASE || "").replace(/\/$/, "");
		if (!API_BASE) return;
		(async () => {
			try {
				const res = await fetch(`${API_BASE}/wp-json/wp/v2/posts?_embed=1&per_page=100`, { signal: controller.signal });
				if (!res.ok) return;
				const json = await res.json();
				const normalized: NormalizedPost[] = json.map((p: any) => ({
					id: p.id,
					slug: p.slug,
					title: p.title.rendered,
					excerptHtml: p.excerpt.rendered,
					contentHtml: p.content.rendered,
					date: p.date,
					authorName: p._embedded?.author?.[0]?.name,
					featuredImageUrl: p._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.large?.source_url || p._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
					categories: (p._embedded?.["wp:term"]?.[0] || []) as any,
					tags: (p._embedded?.["wp:term"]?.[1] || []) as any,
				}));
				setData(normalized);
			} catch {}
		})();
		return () => controller.abort();
	}, []);

	const results = useMemo(() => {
		const query = q.trim().toLowerCase();
		if (!query) return data;
		return data.filter((p) =>
			[p.title, p.contentHtml]
				.map((s) => s.toLowerCase())
				.some((s) => s.includes(query))
		);
	}, [q, data]);

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
			<h1 className="text-2xl font-bold tracking-tight mb-2">Search the blog</h1>
			<p className="text-muted mb-6">Find articles by title or content. Results update as you type.</p>
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


