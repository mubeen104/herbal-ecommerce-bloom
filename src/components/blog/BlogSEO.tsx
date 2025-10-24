import { Helmet } from 'react-helmet-async';
import { BlogPost } from '@/hooks/useBlogPosts';

interface BlogSEOProps {
  post?: BlogPost;
  isListPage?: boolean;
}

const BlogSEO = ({ post, isListPage = false }: BlogSEOProps) => {
  if (isListPage) {
    return (
      <Helmet>
        <title>Health & Wellness Blog | Natural Remedies & Herbal Tips | New Era Herbals</title>
        <meta 
          name="description" 
          content="Explore expert articles on natural health, herbal remedies, wellness tips, and holistic living. Learn about organic supplements, ayurvedic practices, and natural healing methods." 
        />
        <meta 
          name="keywords" 
          content="health blog, wellness articles, herbal remedies, natural health tips, ayurvedic blog, organic wellness, holistic health blog, herbal medicine articles, natural remedies blog" 
        />
        <link rel="canonical" content="https://www.neweraherbals.com/blog" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.neweraherbals.com/blog" />
        <meta property="og:title" content="Health & Wellness Blog | New Era Herbals" />
        <meta property="og:description" content="Expert articles on natural health, herbal remedies, and holistic wellness." />
        <meta property="og:image" content="https://www.neweraherbals.com/logo.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.neweraherbals.com/blog" />
        <meta name="twitter:title" content="Health & Wellness Blog" />
        <meta name="twitter:description" content="Expert articles on natural health and herbal remedies." />
        <meta name="twitter:image" content="https://www.neweraherbals.com/logo.png" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "New Era Herbals Health & Wellness Blog",
            "description": "Expert articles on natural health, herbal remedies, and holistic wellness",
            "url": "https://www.neweraherbals.com/blog",
            "publisher": {
              "@type": "Organization",
              "name": "New Era Herbals",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.neweraherbals.com/logo.png"
              }
            }
          })}
        </script>
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.neweraherbals.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://www.neweraherbals.com/blog"
              }
            ]
          })}
        </script>
      </Helmet>
    );
  }

  if (!post) return null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.meta_description || post.short_description || post.title,
    "image": "https://www.neweraherbals.com/logo.png",
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": {
      "@type": "Person",
      "name": "New Era Herbals Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "New Era Herbals",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.neweraherbals.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.neweraherbals.com/blog/${post.slug}`
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.neweraherbals.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://www.neweraherbals.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://www.neweraherbals.com/blog/${post.slug}`
      }
    ]
  };

  return (
    <Helmet>
      <title>{post.meta_title || `${post.title} | New Era Herbals Blog`}</title>
      <meta 
        name="description" 
        content={post.meta_description || post.short_description || post.title} 
      />
      <link rel="canonical" content={`https://www.neweraherbals.com/blog/${post.slug}`} />
      <meta name="author" content="New Era Herbals Team" />
      <meta name="article:published_time" content={post.created_at} />
      {post.updated_at && <meta name="article:modified_time" content={post.updated_at} />}
      
      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={`https://www.neweraherbals.com/blog/${post.slug}`} />
      <meta property="og:title" content={post.meta_title || post.title} />
      <meta property="og:description" content={post.meta_description || post.short_description || post.title} />
      <meta property="og:image" content="https://www.neweraherbals.com/logo.png" />
      <meta property="og:site_name" content="New Era Herbals" />
      <meta property="article:published_time" content={post.created_at} />
      {post.updated_at && <meta property="article:modified_time" content={post.updated_at} />}
      <meta property="article:author" content="New Era Herbals Team" />
      <meta property="article:section" content="Health & Wellness" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={`https://www.neweraherbals.com/blog/${post.slug}`} />
      <meta name="twitter:title" content={post.meta_title || post.title} />
      <meta name="twitter:description" content={post.meta_description || post.short_description || post.title} />
      <meta name="twitter:image" content="https://www.neweraherbals.com/logo.png" />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
    </Helmet>
  );
};

export default BlogSEO;