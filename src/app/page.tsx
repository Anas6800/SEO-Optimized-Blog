import { getPostsWithResilientImages } from "@/lib/wp";
import PostList from "@/components/PostList";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams?.page ?? "1");
  const perPage = 9;
  
  try {
    const { posts, totalPages } = await getPostsWithResilientImages({ page, perPage });
    
    // Filter out any invalid posts
    const validPosts = posts.filter(post => 
      post.title && 
      post.title !== 'Untitled' && 
      post.slug && 
      post.contentHtml
    );
    
    return (
      <div>
        <section className="border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
            <h1 className="heading-hero">Stories, insights, and updates</h1>
            <p className="text-muted mt-2 max-w-2xl">A fast, SEO-optimized blog powered by Next.js and WordPress. Discover the latest posts below.</p>
            <div className="mt-6">
              <a className="btn-outline" href="#posts">Browse posts</a>
            </div>
          </div>
        </section>
        <div id="posts" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <PostList posts={validPosts} />
            <Pagination basePath="/" page={page} totalPages={totalPages} />
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading home page:', error);
    return (
      <div>
        <section className="border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
            <h1 className="heading-hero">Stories, insights, and updates</h1>
            <p className="text-muted mt-2 max-w-2xl">A fast, SEO-optimized blog powered by Next.js and WordPress. Discover the latest posts below.</p>
          </div>
        </section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="card-surface p-6 text-center">
            <p className="text-gray-400">Unable to load posts at the moment. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }
}
