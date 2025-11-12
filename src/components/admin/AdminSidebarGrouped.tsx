import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ChevronRight,
  Star,
  Percent,
  Image,
  FileText,
  Target,
  MessageSquare,
  CreditCard,
  Rss,
  Store,
  Megaphone,
  Cog,
} from 'lucide-react';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}

const adminMenuGroups: MenuGroup[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      {
        title: 'Overview',
        url: '/admin',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Store Management',
    icon: Store,
    items: [
      {
        title: 'Point of Sale',
        url: '/admin/pos',
        icon: CreditCard,
      },
      {
        title: 'Products',
        url: '/admin/products',
        icon: Package,
      },
      {
        title: 'Categories',
        url: '/admin/categories',
        icon: FolderTree,
      },
      {
        title: 'Orders',
        url: '/admin/orders',
        icon: ShoppingCart,
      },
      {
        title: 'Coupons',
        url: '/admin/coupons',
        icon: Percent,
      },
    ],
  },
  {
    title: 'Customer Relations',
    icon: Users,
    items: [
      {
        title: 'Users',
        url: '/admin/users',
        icon: Users,
      },
      {
        title: 'Reviews',
        url: '/admin/reviews',
        icon: Star,
      },
      {
        title: 'Testimonials',
        url: '/admin/testimonials',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: 'Marketing & Content',
    icon: Megaphone,
    items: [
      {
        title: 'Blog',
        url: '/admin/blog',
        icon: FileText,
      },
      {
        title: 'Hero Slides',
        url: '/admin/hero-slides',
        icon: Image,
      },
      {
        title: 'Advertising Pixels',
        url: '/admin/pixels',
        icon: Target,
      },
      {
        title: 'Catalog Feeds',
        url: '/admin/catalog-feeds',
        icon: Rss,
      },
    ],
  },
  {
    title: 'System',
    icon: Cog,
    items: [
      {
        title: 'Analytics',
        url: '/admin/analytics',
        icon: BarChart3,
      },
      {
        title: 'Settings',
        url: '/admin/settings',
        icon: Settings,
      },
    ],
  },
];

export function AdminSidebarGrouped() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) =>
    path === '/admin' ? currentPath === path : currentPath.startsWith(path);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md'
        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
    }`;

  return (
    <div className="w-56 lg:w-72 h-full bg-gradient-to-b from-card via-card/95 to-muted/30 backdrop-blur-xl border-r border-border/30 flex flex-col shadow-elevated">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <div className="relative">
            <img
              src="/logo.png"
              alt="New Era Herbals Logo"
              className="h-10 lg:h-12 w-auto rounded-lg shadow-soft hover:shadow-medium transition-shadow duration-300"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src =
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0idXJsKCNncmFkaWVudDApIi8+CjxwYXRoIGQ9Ik0yMCAzMkMxNy4yIDMyIDE1IDI5LjggMTUgMjdWMThDMTUgMTUuMiAxNy4yIDEzIDIwIDEzQzIyLjggMTMgMjUgMTUuMiAyNSAxOFYyN0MyNSAyOS44IDIyLjggMzIgMjAgMzJaIiBmaWxsPSJmZmZmZmYiIG9wYWNpdHk9IjAuOSIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjEwIiByPSIzIiBmaWxsPSJmZmZmZmYiIG9wYWNpdHk9IjAuOSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudDAiIHgxPSIwIiB5MT0iMCIgeDI9IjQwIiB5Mj0iNDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzA1OTY2OSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzNDZENTMiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K';
              }}
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-xs text-muted-foreground">New Era Herbals</p>
          </div>
        </div>
      </div>

      {/* Navigation - Grouped */}
      <div className="flex-1 p-3 lg:p-4 overflow-auto">
        <nav className="space-y-6">
          {adminMenuGroups.map((group, groupIndex) => {
            const GroupIcon = group.icon;

            return (
              <div key={group.title} className="space-y-2">
                {/* Group Header */}
                <div className="flex items-center space-x-2 px-3 mb-2">
                  <GroupIcon className="h-4 w-4 text-muted-foreground/70 hidden lg:block" />
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden lg:block">
                    {group.title}
                  </h3>
                  <div className="flex-1 h-px bg-border/30 hidden lg:block"></div>
                </div>

                {/* Group Items */}
                <div className="space-y-1">
                  {group.items.map((item, itemIndex) => {
                    const ItemIcon = item.icon;
                    const active = isActive(item.url);

                    return (
                      <NavLink
                        key={item.url}
                        to={item.url}
                        end={item.url === '/admin'}
                        className={({ isActive }) => getNavCls({ isActive })}
                        style={{
                          animationDelay: `${(groupIndex * group.items.length + itemIndex) * 30}ms`,
                        }}
                      >
                        <ItemIcon className="h-4 w-4 mr-3 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                        <span className="font-medium flex-1 text-sm truncate hidden lg:block">
                          {item.title}
                        </span>
                        {active && (
                          <ChevronRight className="h-4 w-4 flex-shrink-0 hidden lg:block" />
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/20 bg-gradient-to-r from-muted/20 to-muted/10">
        <div className="text-center">
          <p className="text-xs text-muted-foreground hidden lg:block">
            v2.0.1 • Enhanced UX
          </p>
          <div className="flex justify-center mt-2 lg:hidden space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
