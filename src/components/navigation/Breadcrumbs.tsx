import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const { data: productData } = useQuery({
    queryKey: ['breadcrumb-product', pathnames[1]],
    queryFn: async () => {
      if (pathnames[0] === 'product' && pathnames[1]) {
        const { data } = await supabase
          .from('products')
          .select('name, product_categories(category_id, categories(name, slug))')
          .eq('id', pathnames[1])
          .single();
        return data;
      }
      return null;
    },
    enabled: pathnames[0] === 'product' && !!pathnames[1],
  });

  const { data: categoryData } = useQuery({
    queryKey: ['breadcrumb-category', location.search, pathnames[1]],
    queryFn: async () => {
      const params = new URLSearchParams(location.search);
      const categorySlug = params.get('category');

      if (categorySlug) {
        const { data } = await supabase
          .from('categories')
          .select('name')
          .eq('slug', categorySlug)
          .single();
        return data;
      }

      if (pathnames[0] === 'category' && pathnames[1]) {
        const { data } = await supabase
          .from('categories')
          .select('name')
          .eq('slug', pathnames[1])
          .single();
        return data;
      }

      return null;
    },
    enabled: (location.pathname === '/shop' && location.search.includes('category=')) ||
             (pathnames[0] === 'category' && !!pathnames[1]),
  });

  if (pathnames.length === 0 || pathnames[0] === 'admin' || pathnames[0] === 'auth') {
    return null;
  }

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    if (pathnames[0] === 'shop') {
      breadcrumbs.push({ label: 'Shop', href: '/shop' });

      if (categoryData) {
        breadcrumbs.push({
          label: categoryData.name,
          href: `/shop?category=${new URLSearchParams(location.search).get('category')}`
        });
      }
    } else if (pathnames[0] === 'product' && productData) {
      breadcrumbs.push({ label: 'Shop', href: '/shop' });

      if (productData.product_categories?.[0]?.categories) {
        const category = productData.product_categories[0].categories;
        breadcrumbs.push({
          label: category.name,
          href: `/shop?category=${category.slug}`,
        });
      }

      breadcrumbs.push({
        label: productData.name,
        href: `/product/${pathnames[1]}`
      });
    } else if (pathnames[0] === 'category') {
      breadcrumbs.push({ label: 'Shop', href: '/shop' });

      if (categoryData && pathnames[1]) {
        breadcrumbs.push({
          label: categoryData.name,
          href: `/category/${pathnames[1]}`
        });
      }
    } else if (pathnames[0] === 'blog') {
      breadcrumbs.push({ label: 'Blog', href: '/blog' });
      if (pathnames[1]) {
        breadcrumbs.push({
          label: 'Article',
          href: location.pathname
        });
      }
    } else if (pathnames[0] === 'about') {
      breadcrumbs.push({ label: 'About Us', href: '/about' });
    } else if (pathnames[0] === 'contact') {
      breadcrumbs.push({ label: 'Contact', href: '/contact' });
    } else if (pathnames[0] === 'cart') {
      breadcrumbs.push({ label: 'Shopping Cart', href: '/cart' });
    } else if (pathnames[0] === 'checkout') {
      breadcrumbs.push({ label: 'Checkout', href: '/checkout' });
    } else if (pathnames[0] === 'orders') {
      breadcrumbs.push({ label: 'My Orders', href: '/orders' });
    } else if (pathnames[0] === 'profile') {
      breadcrumbs.push({ label: 'My Profile', href: '/profile' });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-muted/30 border-b border-border py-3"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol
          className="flex items-center space-x-2 text-sm"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <li
                key={crumb.href}
                className="flex items-center"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {index === 0 ? (
                  <Link
                    to={crumb.href}
                    className="flex items-center text-muted-foreground hover:text-primary transition-colors duration-300"
                    itemProp="item"
                  >
                    <Home className="h-4 w-4" />
                    <span className="sr-only" itemProp="name">
                      {crumb.label}
                    </span>
                    <meta itemProp="position" content={String(index + 1)} />
                  </Link>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4 text-muted-foreground mx-2 flex-shrink-0" />
                    {isLast ? (
                      <span
                        className="text-foreground font-medium truncate"
                        itemProp="name"
                        aria-current="page"
                      >
                        {crumb.label}
                        <meta itemProp="position" content={String(index + 1)} />
                      </span>
                    ) : (
                      <Link
                        to={crumb.href}
                        className="text-muted-foreground hover:text-primary transition-colors duration-300 truncate"
                        itemProp="item"
                      >
                        <span itemProp="name">{crumb.label}</span>
                        <meta itemProp="position" content={String(index + 1)} />
                      </Link>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
