type Props = { url: string; title: string };

export default function ShareButtons({ url, title }: Props) {
	const encodedUrl = encodeURIComponent(url);
	const encodedTitle = encodeURIComponent(title);
	return (
		<div className="flex items-center gap-3 text-sm text-gray-200">
			<a
				href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className="hover:underline"
			>
				Facebook
			</a>
			<a
				href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
				target="_blank"
				rel="noopener noreferrer"
				className="text-blue-600 hover:underline"
			>
				Twitter/X
			</a>
			<a
				href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className="text-blue-600 hover:underline"
			>
				LinkedIn
			</a>
			<a
				href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className="text-blue-600 hover:underline"
			>
				WhatsApp
			</a>
		</div>
	);
}


