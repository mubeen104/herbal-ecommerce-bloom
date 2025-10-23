import { useBlogPosts } from '@/hooks/useBlogPosts';
import BlogCardPreview from './BlogCardPreview';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedBlogPosts = () => {
  const { data: blogPosts, isLoading } = useBlogPosts(true);
  
  // Get featured posts, limited to 3
  const featuredPosts = blogPosts?.filter(post => post.is_featured).slice(0, 3) || [];
  
  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-muted/30 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Health & Wellness Insights
              </h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover expert tips, natural remedies, and wellness advice from our health experts
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-card rounded-lg overflow-hidden shadow-lg border border-border animate-pulse">
                <div className="bg-muted h-56 w-full" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-6 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="h-10 bg-muted rounded-full w-32 mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-muted/30 via-background to-accent/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-primary mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Health & Wellness Insights
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover expert tips, natural remedies, and wellness advice from our health experts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredPosts.map((post) => (
            <BlogCardPreview key={post.id} post={post} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/blog">
            <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
              View All Articles
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBlogPosts;