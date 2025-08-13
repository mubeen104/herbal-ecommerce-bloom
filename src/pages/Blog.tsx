import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import BlogCardPreview from '@/components/blog/BlogCardPreview';
import BlogSEO from '@/components/blog/BlogSEO';

const Blog = () => {
  const { data: blogPosts, isLoading, error } = useBlogPosts(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading blog posts...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-destructive">Error loading blog posts</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <BlogSEO isListPage={true} />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Health & Wellness Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover natural health tips, herbal remedies, and wellness advice from our experts
            </p>
          </div>

          {/* Blog Posts Grid */}
          {blogPosts && blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <BlogCardPreview key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                No blog posts yet
              </h3>
              <p className="text-muted-foreground">
                Check back soon for helpful health and wellness articles!
              </p>
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Blog;