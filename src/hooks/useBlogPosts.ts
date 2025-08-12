import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  short_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export const useBlogPosts = (publishedOnly = true) => {
  return useQuery({
    queryKey: ['blog-posts', publishedOnly],
    queryFn: async (): Promise<BlogPost[]> => {
      let query = (supabase as any)
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (publishedOnly) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []) as BlogPost[];
    },
  });
};

export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async (): Promise<BlogPost | null> => {
      const { data, error } = await (supabase as any)
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as BlogPost | null;
    },
    enabled: !!slug,
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: {
      title: string;
      slug: string;
      content: string;
      short_description?: string;
      meta_title?: string;
      meta_description?: string;
      is_published: boolean;
      is_featured?: boolean;
      author_id: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from('blog_posts')
        .insert([post])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as BlogPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BlogPost> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as BlogPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
};