import Link from "next/link";
import { getCategories } from "@/lib/wp";

export default async function Sidebar() {
	const categories = await getCategories();
	return (
		<aside className="space-y-4">
			<div className="card-surface p-4">
				<h2 className="text-base font-semibold mb-2 text-white">Categories</h2>
				<ul className="space-y-1 text-sm">
					{categories.map((c) => (
						<li key={c.id}>
							<Link className="text-indigo-300 hover:underline" href={`/category/${c.slug}`}>
								{c.name}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</aside>
	);
}


