# Content Revalidation Guide

## Problem Solved
Your blog posts weren't updating when you made changes in WordPress due to aggressive caching.

## What I Fixed

### 1. **Faster Revalidation**
- Changed ISR revalidation from 5 minutes to 1 minute
- Added `dynamic = 'force-dynamic'` for better content freshness

### 2. **Cache Busting**
- Updated WordPress API calls to use `cache: 'no-store'`
- Added `next: { revalidate: 0 }` for immediate updates

### 3. **Manual Revalidation API**
- Created `/api/revalidate` endpoint for manual cache clearing
- Can be called when you update content in WordPress

## How to Use

### Automatic Updates
- Content now updates automatically every 1 minute
- No action needed for most updates

### Manual Revalidation (Immediate Updates)
When you update a post in WordPress and want it to show immediately:

```bash
# Revalidate all blog posts
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"token": "your-secret-token"}'

# Revalidate specific post
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"path": "/blog/your-post-slug", "token": "your-secret-token"}'
```

### WordPress Webhook (Recommended)
Set up a webhook in WordPress to automatically call the revalidation API when posts are updated:

1. Install a webhook plugin in WordPress
2. Configure it to call: `https://your-site.com/api/revalidate`
3. Set the payload to: `{"token": "your-secret-token"}`

## Environment Variables
Add this to your `.env.local`:

```bash
REVALIDATE_TOKEN=your-secret-token-here
```

## Testing
1. Update a post in WordPress
2. Wait up to 1 minute for automatic update, OR
3. Call the revalidation API for immediate update
4. Refresh your blog page to see changes

## Benefits
- ✅ Content updates in real-time
- ✅ No more waiting for cache to expire
- ✅ Better user experience
- ✅ SEO-friendly with fresh content
- ✅ Manual override when needed
