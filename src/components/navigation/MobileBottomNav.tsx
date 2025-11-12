import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, Grid3x3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestCart } from '@/hooks/useGuestCart';
import { cn } from '@/lib/utils';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { cartCount } = useGuestCart();

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      badge: null,
    },
    {
      name: 'Shop',
      href: '/shop',
      icon: Grid3x3,
      badge: null,
    },
    {
      name: 'Cart',
      href: '/cart',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      name: 'Account',
      href: user ? '/profile' : '/auth',
      icon: User,
      badge: null,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-elevated z-50 safe-area-inset-bottom"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full relative group transition-all duration-300',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={item.name}
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'h-6 w-6 transition-transform duration-300',
                    active ? 'scale-110' : 'group-hover:scale-105'
                  )}
                />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-bounce">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1 font-medium transition-all duration-300',
                  active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                )}
              >
                {item.name}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
