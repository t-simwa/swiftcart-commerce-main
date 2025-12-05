import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, Heart, MapPin, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems, toggleCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main Header */}
      <div className="bg-foreground text-background">
        <div className="container-wide">
          <div className="flex h-14 md:h-16 items-center gap-3 md:gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 shrink-0 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="text-base font-black text-primary-foreground">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-background">
                Swift<span className="text-primary">Cart</span>
              </span>
            </Link>

            {/* Delivery Location - Desktop */}
            <button className="hidden lg:flex items-center gap-1 text-xs hover:outline hover:outline-1 hover:outline-background/30 rounded p-1.5 -m-1.5 transition-all">
              <MapPin className="h-4 w-4 text-background/70" />
              <div className="text-left">
                <p className="text-background/70 text-xxs">Deliver to</p>
                <p className="font-medium text-background">Nairobi</p>
              </div>
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
              <div className="relative w-full flex">
                <div className="flex-1 relative">
                  <Input
                    type="search"
                    placeholder="Search products, brands, and categories..."
                    className="w-full h-10 pl-4 pr-12 rounded-l-md rounded-r-none border-0 bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-10 w-12 rounded-l-none rounded-r-md bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-2 ml-auto">
              {/* Account */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
              <button className="hidden md:flex flex-col items-start text-xs hover:outline hover:outline-1 hover:outline-background/30 rounded p-1.5 -m-1.5 transition-all">
                      <span className="text-background/70 text-xxs">
                        Hello, {user.firstName || user.email.split('@')[0]}
                      </span>
                      <span className="font-medium text-background flex items-center gap-0.5">
                        Account <ChevronDown className="h-3 w-3" />
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/account')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex flex-col items-start text-xs hover:outline hover:outline-1 hover:outline-background/30 rounded p-1.5 -m-1.5 transition-all"
                >
                <span className="text-background/70 text-xxs">Hello, Sign in</span>
                <span className="font-medium text-background flex items-center gap-0.5">
                  Account <ChevronDown className="h-3 w-3" />
                </span>
                </Link>
              )}

              {/* Orders */}
              <Link 
                to="/orders" 
                className="hidden lg:flex flex-col items-start text-xs hover:outline hover:outline-1 hover:outline-background/30 rounded p-1.5 -m-1.5 transition-all"
              >
                <span className="text-background/70 text-xxs">Returns</span>
                <span className="font-medium text-background">& Orders</span>
              </Link>

              {/* Notifications */}
              {isAuthenticated && <NotificationCenter />}

              {/* Wishlist - Mobile & Desktop */}
              <Button variant="ghost" size="icon" className="text-background hover:bg-background/10 relative">
                <Heart className="h-5 w-5" />
              </Button>

              {/* Account - Mobile */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden text-background hover:bg-background/10">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/account')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
              <Button variant="ghost" size="icon" className="md:hidden text-background hover:bg-background/10">
                <User className="h-5 w-5" />
              </Button>
                </Link>
              )}

              {/* Cart */}
              <Button
                variant="ghost"
                className="relative text-background hover:bg-background/10 flex items-end gap-0.5 px-2"
                onClick={toggleCart}
              >
                <div className="relative">
                  <ShoppingCart className="h-7 w-7" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground animate-scale-in px-1">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-xs font-medium text-background mb-0.5">Cart</span>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-background hover:bg-background/10"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation - Desktop */}
      <div className="hidden md:block bg-secondary-foreground/95 text-background border-b border-background/10">
        <div className="container-wide">
          <nav className="flex items-center gap-1 h-10 text-sm overflow-x-auto">
            <button className="flex items-center gap-1 font-medium px-2 py-1 hover:outline hover:outline-1 hover:outline-background/30 rounded transition-all whitespace-nowrap">
              <Menu className="h-4 w-4" />
              All
            </button>
            <Link
              to="/products"
              className={cn(
                "px-2 py-1 hover:outline hover:outline-1 hover:outline-background/30 rounded transition-all whitespace-nowrap",
                isActive("/products") && "outline outline-1 outline-background/30"
              )}
            >
              All Products
            </Link>
            <Link
              to="/categories"
              className={cn(
                "px-2 py-1 hover:outline hover:outline-1 hover:outline-background/30 rounded transition-all whitespace-nowrap",
                isActive("/categories") && "outline outline-1 outline-background/30"
              )}
            >
              Categories
            </Link>
            <Link
              to="/deals"
              className="px-2 py-1 hover:outline hover:outline-1 hover:outline-background/30 rounded transition-all whitespace-nowrap text-primary font-medium"
            >
              Today's Deals
            </Link>
            <Link
              to="/products?category=electronics"
              className="px-2 py-1 hover:outline hover:outline-1 hover:outline-background/30 rounded transition-all whitespace-nowrap"
            >
              Electronics
            </Link>
            <Link
              to="/products?category=fashion"
              className="px-2 py-1 hover:outline hover:outline-1 hover:outline-background/30 rounded transition-all whitespace-nowrap"
            >
              Fashion
            </Link>
            <Link
              to="/products?category=home"
              className="px-2 py-1 hover:outline hover:outline-1 hover:outline-background/30 rounded transition-all whitespace-nowrap"
            >
              Home & Kitchen
            </Link>
            <Link
              to="/help"
              className="px-2 py-1 hover:outline hover:outline-1 hover:outline-background/30 rounded transition-all whitespace-nowrap ml-auto"
            >
              Customer Service
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden bg-foreground pb-2 px-3">
        <form onSubmit={handleSearch}>
          <div className="relative flex">
            <Input
              type="search"
              placeholder="Search SwiftCart"
              className="w-full h-9 pl-3 pr-10 rounded-md border-0 bg-background text-foreground placeholder:text-muted-foreground text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              variant="ghost"
              className="absolute right-0 top-0 h-9 w-9 text-primary"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-x-0 top-[104px] bottom-0 bg-background z-40 md:hidden transition-all duration-200 overflow-y-auto",
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
      >
        <nav className="p-4 space-y-1">
          {isAuthenticated && user ? (
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">{user.firstName || user.email.split('@')[0]}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-3 p-3 bg-secondary rounded-lg mb-4"
              onClick={() => setIsMenuOpen(false)}
            >
            <User className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Hello, Sign in</p>
              <p className="text-sm text-muted-foreground">Access account & manage orders</p>
            </div>
            </Link>
          )}

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-4 pb-2">Shop By Category</p>
          
          <Link
            to="/products"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="font-medium">All Products</span>
            <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
          </Link>
          <Link
            to="/categories"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="font-medium">Categories</span>
            <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
          </Link>
          <Link
            to="/deals"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="font-medium text-primary">Today's Deals</span>
            <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
          </Link>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-6 pb-2">Help & Settings</p>
          
          {isAuthenticated ? (
            <>
          <Link
            to="/account"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="font-medium">Your Account</span>
            <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
          </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors text-destructive"
              >
                <span className="font-medium">Logout</span>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="font-medium">Sign In</span>
              <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
            </Link>
          )}
          <Link
            to="/help"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="font-medium">Customer Service</span>
            <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
          </Link>
        </nav>
      </div>
    </header>
  );
}