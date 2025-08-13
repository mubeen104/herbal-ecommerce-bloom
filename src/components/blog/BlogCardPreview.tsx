import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Eye, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import parse from 'html-react-parser';
import { BlogPost } from '@/hooks/useBlogPosts';

interface BlogCardPreviewProps {
  post: BlogPost;
  showAuthor?: boolean;
}

const BlogCardPreview = ({ post, showAuthor = false }: BlogCardPreviewProps) => {
  const getExcerpt = (content: string, maxLength = 150) => {
    // Parse HTML and extract text
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  const getReadingTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const avgWordsPerMinute = 200;
    return Math.ceil(words / avgWordsPerMinute);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50 bg-card">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
          
          <div className="w-1 h-1 bg-muted-foreground rounded-full" />
          
          <Clock className="h-4 w-4" />
          <span>{getReadingTime(post.content)} min read</span>
          
          {post.is_featured && (
            <>
              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
              <Badge variant="secondary" className="text-xs">Featured</Badge>
            </>
          )}
        </div>
        
        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {post.title}
        </CardTitle>
        
        <CardDescription className="line-clamp-3 text-muted-foreground">
          {post.short_description ? post.short_description : getExcerpt(post.content)}
        </CardDescription>
        
        {showAuthor && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Author ID: {post.author_id.substring(0, 8)}...</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <Link to={`/blog/${post.slug}`}>
          <Button 
            variant="outline" 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
          >
            <Eye className="h-4 w-4 mr-2" />
            Read More
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default BlogCardPreview;