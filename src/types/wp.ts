export interface WPMediaSizeDetails {
	file?: string;
	width?: number;
	height?: number;
	source_url?: string;
}

export interface WPMediaSizes {
	thumbnail?: WPMediaSizeDetails;
	medium?: WPMediaSizeDetails;
	large?: WPMediaSizeDetails;
	full?: WPMediaSizeDetails;
	[key: string]: WPMediaSizeDetails | undefined;
}

export interface WPMedia {
	id: number;
	source_url?: string;
	media_details?: {
		sizes?: WPMediaSizes;
	};
}

export interface WPAuthor {
	id: number;
	name: string;
}

export interface WPTerm {
	id: number;
	slug: string;
	name: string;
}

export interface WPPost {
	id: number;
	slug: string;
	title: { rendered: string };
	excerpt: { rendered: string };
	content: { rendered: string };
	date: string;
	modified: string;
	featured_media?: number;
	_embedded?: {
		"wp:featuredmedia"?: WPMedia[];
		author?: WPAuthor[];
		"wp:term"?: WPTerm[][];
	};
}

export type WPCategory = WPTerm;
export type WPTag = WPTerm;

export interface NormalizedPost {
	id: number;
	slug: string;
	title: string;
	excerptHtml: string;
	contentHtml: string;
	date: string;
	dateDisplay: string;
	authorName?: string;
	featuredImageUrl?: string;
	categories: WPCategory[];
	tags: WPTag[];
}


