import { useState } from "react";
import { Search, ShoppingBag, User, Menu, X, Leaf, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { AuthModal } from "@/components/auth/AuthModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useNavigate, Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut, isAdmin } = useAuth();
  const { cartCount } = useGuestCart();
  const { storeName } = useStoreSettings();
  const navigate = useNavigate();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Contact Us", href: "/contact" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-border/50 sticky top-0 z-50 hover-glow animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4 group animate-bounce-in hover-float">
            <div className="relative transform transition-all duration-300 hover:scale-110 hover-rotate">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-3 shadow-md transition-all duration-300 group-hover:shadow-2xl group-hover:from-primary/20 group-hover:to-accent/20 animate-pulse-ring">
                <img 
                  src="/logo.png" 
                  alt={`${storeName} Logo`} 
                  className="h-10 w-auto transition-transform duration-300 group-hover:rotate-12 animate-pulse-slow"
                />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-bold text-foreground tracking-tight transition-colors duration-300 group-hover:text-primary animate-gradient bg-gradient-to-r from-foreground to-primary bg-clip-text group-hover:text-transparent">
                {storeName}
              </span>
              <div className="h-0.5 bg-gradient-to-r from-primary to-accent w-0 group-hover:w-full transition-all duration-500 animate-shimmer"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                className="relative px-6 py-3 text-foreground hover:text-primary transition-all duration-300 font-semibold group hover-lift hover-glow animate-slide-in"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <span className="relative z-10 group-hover:animate-wiggle">{item.name}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl scale-0 group-hover:scale-100 transition-all duration-300 origin-center animate-shimmer"></div>
                <div className="absolute bottom-1 left-1/2 w-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full group-hover:w-8 transition-all duration-300 transform -translate-x-1/2 animate-pulse-slow"></div>
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/10 to-accent/10 blur-sm -z-10"></div>
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-md mx-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <form onSubmit={handleSearch} className="relative w-full group hover-lift">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 group-focus-within:animate-bounce-subtle" />
              <Input
                type="text"
                placeholder="Search herbs, supplements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-12 pr-4 py-3 bg-muted/20 border-2 border-muted text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:shadow-xl hover:shadow-lg rounded-full transition-all duration-300 hover:border-primary/50 focus:animate-glow hover-glow"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer -z-10"></div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-12 w-12 text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-xl hover-glow animate-pulse-ring">
                    <User className="h-5 w-5 hover:animate-wiggle" />
                  </Button>
                </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md border-border/50 animate-slide-down shadow-xl">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center w-full hover-scale">
                      <User className="h-4 w-4 mr-2 hover:animate-bounce-subtle" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center w-full hover-scale">
                      <ShoppingBag className="h-4 w-4 mr-2 hover:animate-bounce-subtle" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="hover-scale">
                        <Settings className="h-4 w-4 mr-2 hover:animate-spin-slow" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="hover-scale">
                    <LogOut className="h-4 w-4 mr-2 hover:animate-wiggle" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="h-12 w-12 text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-xl hover-glow animate-pulse-ring" asChild>
                <Link to="/auth">
                  <User className="h-5 w-5 hover:animate-wiggle" />
                </Link>
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="h-12 w-12 text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 rounded-full transition-all duration-300 relative hover:scale-110 hover:shadow-xl hover-glow animate-pulse-ring" asChild>
              <Link to="/cart">
                <ShoppingBag className="h-5 w-5 hover:animate-bounce-subtle" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold animate-bounce-in hover:animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-12 w-12 text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 rounded-full transition-all duration-300 hover:scale-110 hover-rotate"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5 animate-wiggle" /> : <Menu className="h-5 w-5 hover:animate-wiggle" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-4">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110" />
            <Input
              type="text"
              placeholder="Search herbs, supplements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-12 pr-4 py-3 bg-muted/20 border-2 border-muted text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:shadow-lg rounded-full transition-all duration-300"
            />
          </form>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-border shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-4 text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-300 group font-semibold"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="relative">
                  {item.name}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></div>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;