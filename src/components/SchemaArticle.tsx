export default function SchemaArticle({
	title,
	description,
	url,
	image,
	author,
	datePublished,
}: {
	title: string;
	description: string;
	url: string;
	image?: string;
	author?: string;
	datePublished?: string;
}) {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: title,
		description,
		url,
		image: image ? [image] : undefined,
		author: author ? { "@type": "Person", name: author } : undefined,
		datePublished,
	};
	return (
		<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
	);
}


