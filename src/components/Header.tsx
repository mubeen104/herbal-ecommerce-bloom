import { useState } from "react";
import { Search, ShoppingBag, User, Menu, X, ChevronDown, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { MegaMenu } from "@/components/MegaMenu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useNavigate, Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut, isAdmin } = useAuth();
  const { cartCount } = useGuestCart();
  const { storeName } = useStoreSettings();
  const navigate = useNavigate();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop Now", href: "/shop", hasMegaMenu: true },
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
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
    <header className="bg-white/95 shadow-sm border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative transform transition-all duration-300">
              <img
                src="/logo.png"
                alt={`${storeName} Logo`}
                className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="hidden md:block">
              <span className="text-xl font-bold text-foreground tracking-tight transition-colors duration-300">
                {storeName}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              item.hasMegaMenu ? (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setIsMegaMenuOpen(true)}
                  onMouseLeave={() => setIsMegaMenuOpen(false)}
                >
                  <button
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                  >
                    {item.name}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-all duration-200 group-focus-within:text-primary" />
              <Input
                type="text"
                placeholder="Search natural products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-4 py-2 bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background rounded-full transition-all duration-200"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-border/50">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center w-full">
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center w-full">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="h-10 w-10 text-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200" asChild>
                <Link to="/auth">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="h-10 w-10 text-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200 relative" asChild>
              <Link to="/cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 text-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-all duration-200 group-focus-within:text-primary" />
            <Input
              type="text"
              placeholder="Search natural products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10 pr-4 py-2 bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background rounded-full transition-all duration-200"
            />
          </form>
        </div>
      </div>

      {/* Mega Menu */}
      <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-border/50 shadow-xl animate-fade-in">
          <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-80px)] overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;