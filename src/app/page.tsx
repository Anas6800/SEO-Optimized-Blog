import { getPosts } from "@/lib/wp";
import PostList from "@/components/PostList";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams?.page ?? "1");
  const perPage = 9;
  const { posts, totalPages } = await getPosts({ page, perPage });
  return (
    <div className="relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <section className="relative border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 relative z-10">
          <div className="text-center">
            <h1 className="heading-hero mb-6">
              Stories, insights, and updates
            </h1>
            <p className="text-muted text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              A fast, SEO-optimized blog powered by Next.js and WordPress. Discover the latest posts below.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a className="btn-outline glow" href="#posts">
                <span>🚀 Browse posts</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <a className="btn-outline bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" href="/search">
                <span>🔍 Search articles</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div id="posts" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-4 gap-12 relative">
        <div className="lg:col-span-3">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Latest Posts</h2>
            <p className="text-gray-400">Discover our most recent articles and insights</p>
          </div>
          <PostList posts={posts} />
          <div className="mt-12">
            <Pagination basePath="/" page={page} totalPages={totalPages} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
