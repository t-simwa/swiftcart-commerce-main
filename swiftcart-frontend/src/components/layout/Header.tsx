import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, Heart, MapPin, ChevronDown, LogOut, Globe, Package, CreditCard, HelpCircle, Gift, Star, Settings, FileText, ChevronRight } from "lucide-react";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/products";
import { digitalContentCategories, departmentCategories } from "@/data/categories";

// Search departments/categories - sorted alphabetically, same as "All" menu
const searchDepartments = [
  { value: "all", label: "All Departments" },
  ...departmentCategories
    .map((cat) => ({ value: cat.slug, label: cat.name }))
    .sort((a, b) => a.label.localeCompare(b.label)),
];

// Languages
const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "sw", name: "Swahili", flag: "🇰🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

// Countries/Regions
const countries = [
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedCountry, setSelectedCountry] = useState("KE");
  const [deliveryLocation, setDeliveryLocation] = useState("Nairobi");
  const { totalItems, toggleCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set("search", searchQuery);
      if (selectedDepartment !== "all") {
        params.set("category", selectedDepartment);
      }
      navigate(`/products?${params.toString()}`);
    }
  };

  const handleLocationSave = () => {
    setIsLocationDialogOpen(false);
    // In a real app, this would save to user preferences/localStorage
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main Header */}
      <div className="bg-[#131921] text-white">
        <div className="container-wide">
          <div className="flex h-14 md:h-16 items-center gap-3 md:gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 shrink-0 group px-2 py-1 -m-1 hover:outline hover:outline-1 hover:outline-white/30 rounded transition-all">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="text-base font-black text-primary-foreground">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Swift<span className="text-primary">Cart</span>
              </span>
            </Link>

            {/* Delivery Location - Desktop */}
            <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
              <DialogTrigger asChild>
                <button className="hidden lg:flex items-center gap-1 text-xs hover:outline hover:outline-1 hover:outline-white/30 rounded p-1.5 -m-1.5 transition-all">
                  <MapPin className="h-4 w-4 text-white/70" />
                  <div className="text-left">
                    <p className="text-white/70 text-[10px] leading-tight">Deliver to</p>
                    <p className="font-medium text-white text-xs leading-tight">{deliveryLocation}</p>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Choose your location</DialogTitle>
                  <DialogDescription>
                    Delivery options and delivery speeds may vary for different locations
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {isAuthenticated && (
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Sign in to see your addresses</p>
                      <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                        Sign in
                      </Button>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Country/Region</label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter City/Location</label>
                    <Input
                      placeholder="e.g., Nairobi"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleLocationSave}>Done</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Search Bar with Department Dropdown */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-4xl">
              <div className="relative w-full flex items-stretch">
                {/* Department Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="h-10 px-2 rounded-l-md rounded-r-none border-r border-border bg-gray-100 hover:bg-gray-200 text-foreground text-xs font-normal flex items-center gap-1 min-w-[60px]"
                    >
                      <span className="hidden lg:inline text-xs">
                        {searchDepartments.find(d => d.value === selectedDepartment)?.label.split(' ')[0] || "All"}
                      </span>
                      <span className="lg:hidden text-xs">All</span>
                      <ChevronDown className="h-3 w-3 opacity-70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 max-h-[400px] overflow-y-auto">
                    {searchDepartments.map((dept) => (
                      <DropdownMenuItem
                        key={dept.value}
                        onClick={() => setSelectedDepartment(dept.value)}
                        className={cn(
                          selectedDepartment === dept.value ? "bg-[#e7e7e7] text-primary" : "",
                          "hover:bg-[#e7e7e7] hover:text-primary focus:bg-[#e7e7e7] focus:text-primary"
                        )}
                      >
                        {dept.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Input
                    type="search"
                    placeholder="Search SwiftCart"
                    className="w-full h-10 pl-3 pr-10 rounded-none border-0 bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Search Button */}
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-10 w-12 rounded-l-none rounded-r-md bg-[#dc2626] hover:bg-[#b91c1c] text-foreground border-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-2 ml-auto">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden lg:flex items-center gap-1.5 text-xs hover:outline hover:outline-1 hover:outline-white/30 rounded p-1.5 -m-1.5 transition-all">
                    <img 
                      src="https://flagcdn.com/w20/us.png" 
                      alt="United States" 
                      className="h-4 w-5 object-cover border border-white/20"
                    />
                    <span className="font-medium text-white text-xs">EN</span>
                    <ChevronDown className="h-3 w-3 text-white/70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Choose Language</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={selectedLanguage === lang.code ? "bg-accent" : ""}
                    >
                      <span className="mr-2 text-lg">{lang.flag}</span>
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Account */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex flex-col items-start text-xs hover:outline hover:outline-1 hover:outline-white/30 rounded p-1.5 -m-1.5 transition-all">
                      <span className="text-white/70 text-[10px] leading-tight">
                        Hello, {user.firstName || user.email.split('@')[0]}
                      </span>
                      <span className="font-medium text-white text-xs leading-tight flex items-center gap-0.5">
                        Account & Lists <ChevronDown className="h-3 w-3 text-white/70" />
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[350px] p-0">
                    <div className="p-4 border-b bg-primary/5">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-2">
                        Sign in
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        New customer?{" "}
                        <Link to="/register" className="text-primary hover:underline">
                          Start here.
                        </Link>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div>
                        <DropdownMenuLabel className="px-0 py-2 text-sm font-bold">Your Lists</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/account?tab=lists')} className="px-0">
                          Create a List
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/account?tab=registry')} className="px-0">
                          Find a List or Registry
                        </DropdownMenuItem>
                      </div>
                      <div>
                        <DropdownMenuLabel className="px-0 py-2 text-sm font-bold">Your Account</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/account')} className="px-0">
                          Account
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/orders')} className="px-0">
                          Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/account?tab=recommendations')} className="px-0">
                          Recommendations
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/account?tab=browsing-history')} className="px-0">
                          Browsing History
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/account?tab=wishlist')} className="px-0">
                          Watchlist
                        </DropdownMenuItem>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <DropdownMenuItem onClick={logout} className="text-destructive">
                        Sign Out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex flex-col items-start text-xs hover:outline hover:outline-1 hover:outline-white/30 rounded p-1.5 -m-1.5 transition-all">
                      <span className="text-white/70 text-[10px] leading-tight">Hello, sign in</span>
                      <span className="font-medium text-white text-xs leading-tight flex items-center gap-0.5">
                        Account & Lists <ChevronDown className="h-3 w-3 text-white/70" />
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[350px] p-0">
                    <div className="p-4 border-b bg-primary/5">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-2" onClick={() => navigate('/login')}>
                        Sign in
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        New customer?{" "}
                        <Link to="/register" className="text-primary hover:underline">
                          Start here.
                        </Link>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div>
                        <DropdownMenuLabel className="px-0 py-2 text-sm font-bold">Your Lists</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/account?tab=lists')} className="px-0">
                          Create a List
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/account?tab=registry')} className="px-0">
                          Find a List or Registry
                        </DropdownMenuItem>
                      </div>
                      <div>
                        <DropdownMenuLabel className="px-0 py-2 text-sm font-bold">Your Account</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/orders')} className="px-0">
                          Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/account?tab=wishlist')} className="px-0">
                          Watchlist
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Returns & Orders */}
              <Link 
                to="/orders" 
                className="hidden lg:flex flex-col items-start text-xs hover:outline hover:outline-1 hover:outline-white/30 rounded p-1.5 -m-1.5 transition-all"
              >
                <span className="text-white/70 text-[10px] leading-tight">Returns</span>
                <span className="font-medium text-white text-xs leading-tight">& Orders</span>
              </Link>

              {/* Notifications */}
              {isAuthenticated && <NotificationCenter />}

              {/* Cart */}
              <Link
                to="/cart"
                className="flex items-end gap-1 text-white hover:outline hover:outline-1 hover:outline-white/30 rounded p-1.5 -m-1.5 transition-all"
              >
                <div className="relative">
                  <ShoppingCart className="h-8 w-8" />
                  <span className="absolute -top-1 left-4 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#b91c1c] text-[11px] font-bold text-white px-1">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                </div>
                <span className="hidden sm:block text-xs font-bold text-white mb-0.5">Cart</span>
              </Link>

              {/* Account - Mobile */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
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
                  <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/10"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation - Desktop */}
      <div className="hidden md:block bg-[#232f3e] text-white border-b border-[#131921] relative">
        <div className="container-wide">
          <nav className="flex items-center gap-1 h-9 text-sm overflow-x-auto">
            {/* All Categories Mega Menu - Full Screen Dialog */}
        <Dialog open={isMegaMenuOpen} onOpenChange={(open) => {
          setIsMegaMenuOpen(open);
          if (!open) {
            setSelectedCategory(null);
            setHoveredCategory(null);
            setShowAllDepartments(false);
          }
        }}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 font-medium px-2 py-1 hover:outline hover:outline-1 hover:outline-white/30 rounded transition-all whitespace-nowrap text-white">
                  <Menu className="h-4 w-4" />
                  All
                </button>
              </DialogTrigger>
              <DialogContent className="w-[350px] max-w-[90vw] h-[100vh] max-h-[100vh] p-0 m-0 rounded-none border-0 bg-white overflow-hidden left-0 top-0 translate-x-0 translate-y-0 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0 data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 [&>button]:hidden">
                <div className="flex flex-col h-full relative">
                  {/* Header - Exact Amazon styling */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#232f3e] text-white border-b border-[#131921] shrink-0">
                    <Link
                      to={isAuthenticated ? "/account" : "/login"}
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="flex items-center gap-2 text-white hover:text-white/90 no-underline"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-bold leading-5" style={{ fontFamily: 'inherit' }}>
                        Hello, {isAuthenticated && user ? (user.firstName || user.email.split('@')[0]) : 'sign in'}
                      </span>
                    </Link>
                    <button
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="text-white hover:bg-white/10 rounded p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 shrink-0"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto bg-[#f3f3f3]" style={{ maxHeight: 'calc(100vh - 60px)' }}>
                    {selectedCategory ? (
                      /* Subcategory View */
                      <>
                        {/* Back to Main Menu Button */}
                        <div className="px-4 pt-3 pb-2 bg-white border-b border-[#e7e7e7]">
                          <button
                            onClick={() => setSelectedCategory(null)}
                            className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                            style={{ fontFamily: 'inherit' }}
                          >
                            <span className="flex items-center gap-1">
                              <ChevronRight className="h-4 w-4 rotate-180" />
                              <span>MAIN MENU</span>
                            </span>
                            <ChevronRight className="h-4 w-4 opacity-60" />
                          </button>
                        </div>

                        {/* Category Name and Subcategories */}
                        <div className="px-4 pt-3 pb-4">
                          {(() => {
                            const category = [...digitalContentCategories, ...departmentCategories].find(c => c.slug === selectedCategory);
                            if (!category) return null;
                            
                            return (
                              <>
                                <h2 className="text-base font-bold text-[#111] mb-3 leading-5" style={{ fontFamily: 'inherit' }}>{category.name}</h2>
                                {category.subcategories && category.subcategories.length > 0 ? (
                                  <ul className="space-y-0.5">
                                    {category.subcategories.map((subcat) => (
                                      <li key={subcat.slug}>
                                        <button
                        onClick={() => {
                                            navigate(`/products?category=${category.slug}&subcategory=${subcat.slug}`);
                          setIsMegaMenuOpen(false);
                        }}
                                          className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                                          style={{ fontFamily: 'inherit' }}
                                        >
                                          <span>{subcat.name}</span>
                                          <ChevronRight className="h-4 w-4 opacity-60" />
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-[#666]" style={{ fontFamily: 'inherit' }}>No subcategories available</p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </>
                    ) : (
                      /* Main Menu View */
                      <>
                        {/* Shop by Department Section */}
                        <div className="px-4 pt-3 pb-2">
                          <h3 className="text-xs font-bold text-[#111] uppercase tracking-wide mb-2 leading-4" style={{ fontFamily: 'inherit' }}>Shop by Department</h3>
                          <ul className="space-y-0.5">
                            {(showAllDepartments ? departmentCategories : departmentCategories.slice(0, 4)).map((category) => (
                              <li key={category.slug}>
                                <button
                                  onClick={() => {
                                    setSelectedCategory(category.slug);
                                  }}
                                  className={cn(
                                    "w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between",
                                    "text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                                  )}
                                  style={{ fontFamily: 'inherit' }}
                                >
                                  <span>{category.name}</span>
                                  <ChevronRight className="h-4 w-4 opacity-60" />
                                </button>
                              </li>
                            ))}
                            <li className="pt-1">
                              <button
                                onClick={() => { setShowAllDepartments(!showAllDepartments); }}
                                className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                                style={{ fontFamily: 'inherit' }}
                              >
                                <span>{showAllDepartments ? 'See less' : 'See all'}</span>
                                <ChevronRight className={cn("h-4 w-4 opacity-60 transition-transform", showAllDepartments && "rotate-180")} />
                              </button>
                            </li>
                          </ul>
                        </div>

                        {/* Programs & Features Section */}
                        <div className="px-4 pt-3 pb-2 border-t border-[#e7e7e7]">
                          <h3 className="text-xs font-bold text-[#111] uppercase tracking-wide mb-2 leading-4" style={{ fontFamily: 'inherit' }}>Programs & Features</h3>
                          <ul className="space-y-0.5">
                            <li>
                              <button
                                onClick={() => { navigate('/products?featured=true'); setIsMegaMenuOpen(false); }}
                                className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                                style={{ fontFamily: 'inherit' }}
                              >
                                <span>Gift Cards</span>
                                <ChevronRight className="h-4 w-4 opacity-60" />
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { navigate('/products?interest=true'); setIsMegaMenuOpen(false); }}
                                className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                                style={{ fontFamily: 'inherit' }}
                              >
                                <span>Shop By Interest</span>
                                <ChevronRight className="h-4 w-4 opacity-60" />
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { navigate('/live'); setIsMegaMenuOpen(false); }}
                                className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                                style={{ fontFamily: 'inherit' }}
                              >
                                <span>SwiftCart Live</span>
                                <ChevronRight className="h-4 w-4 opacity-60" />
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { navigate('/international'); setIsMegaMenuOpen(false); }}
                                className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                                style={{ fontFamily: 'inherit' }}
                              >
                                <span>International Shopping</span>
                                <ChevronRight className="h-4 w-4 opacity-60" />
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { navigate('/second-chance'); setIsMegaMenuOpen(false); }}
                                className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                                style={{ fontFamily: 'inherit' }}
                              >
                                <span>SwiftCart Second Chance</span>
                                <ChevronRight className="h-4 w-4 opacity-60" />
                              </button>
                            </li>
                          </ul>
                        </div>

                        {/* Help & Settings Section */}
                        <div className="px-4 pt-3 pb-4 border-t border-[#e7e7e7]">
                          <h3 className="text-xs font-bold text-[#111] uppercase tracking-wide mb-2 leading-4" style={{ fontFamily: 'inherit' }}>Help & Settings</h3>
                          <ul className="space-y-0.5">
                            <li>
                              <button
                                onClick={() => { navigate('/account'); setIsMegaMenuOpen(false); }}
                                className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                                style={{ fontFamily: 'inherit' }}
                              >
                                <span>Your Account</span>
                                <ChevronRight className="h-4 w-4 opacity-60" />
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => {
                                  setSelectedLanguage(selectedLanguage);
                                  setIsMegaMenuOpen(false);
                                }}
                                className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                                style={{ fontFamily: 'inherit' }}
                              >
                                <span className="flex items-center gap-2">
                                  <Globe className="h-4 w-4" />
                                  {languages.find(l => l.code === selectedLanguage)?.name || "English"}
                                </span>
                                <ChevronRight className="h-4 w-4 opacity-60" />
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => {
                                  setIsLocationDialogOpen(true);
                                  setIsMegaMenuOpen(false);
                                }}
                                className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                                style={{ fontFamily: 'inherit' }}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-base">{countries.find(c => c.code === selectedCountry)?.flag || "🇺🇸"}</span>
                                  {countries.find(c => c.code === selectedCountry)?.name || "United States"}
                                </span>
                                <ChevronRight className="h-4 w-4 opacity-60" />
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { navigate('/help'); setIsMegaMenuOpen(false); }}
                                className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                                style={{ fontFamily: 'inherit' }}
                              >
                                <span>Customer Service</span>
                                <ChevronRight className="h-4 w-4 opacity-60" />
                              </button>
                            </li>
                            {!isAuthenticated && (
                              <li>
                                <button
                                  onClick={() => { navigate('/login'); setIsMegaMenuOpen(false); }}
                                  className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                                  style={{ fontFamily: 'inherit' }}
                                >
                                  <span>Sign in</span>
                                  <ChevronRight className="h-4 w-4 opacity-60" />
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Footer with Back to top */}
                        <div className="px-4 py-3 bg-white border-t border-[#e7e7e7]">
                          <button
                            onClick={() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              setIsMegaMenuOpen(false);
                            }}
                            className="w-full text-left text-sm py-1.5 px-2 -mx-2 rounded transition-colors flex items-center justify-between text-[#111] hover:bg-[#e7e7e7] hover:text-primary"
                            style={{ fontFamily: 'inherit' }}
                          >
                            <span>Back to top</span>
                            <ChevronRight className="h-4 w-4 opacity-60" />
                          </button>
                  </div>
                      </>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Link
              to="/deals"
              className={cn(
                "px-2 py-1 hover:outline hover:outline-1 hover:outline-white/30 rounded transition-all whitespace-nowrap text-white",
                isActive("/deals") && "outline outline-1 outline-white/30 font-medium"
              )}
            >
              Today's Deals
            </Link>
            <Link
              to="/products"
              className={cn(
                "px-2 py-1 hover:outline hover:outline-1 hover:outline-white/30 rounded transition-all whitespace-nowrap text-white",
                isActive("/products") && "outline outline-1 outline-white/30"
              )}
            >
              All Products
            </Link>
            <Link
              to="/categories"
              className={cn(
                "px-2 py-1 hover:outline hover:outline-1 hover:outline-white/30 rounded transition-all whitespace-nowrap text-white",
                isActive("/categories") && "outline outline-1 outline-white/30"
              )}
            >
              Categories
            </Link>
            <Link
              to="/products?category=electronics"
              className="px-2 py-1 hover:outline hover:outline-1 hover:outline-white/30 rounded transition-all whitespace-nowrap text-white"
            >
              Electronics
            </Link>
            <Link
              to="/products?category=fashion"
              className="px-2 py-1 hover:outline hover:outline-1 hover:outline-white/30 rounded transition-all whitespace-nowrap text-white"
            >
              Fashion
            </Link>
            <Link
              to="/products?category=home-living"
              className="px-2 py-1 hover:outline hover:outline-1 hover:outline-white/30 rounded transition-all whitespace-nowrap text-white"
            >
              Home & Kitchen
            </Link>
            <Link
              to="/products?category=sports"
              className="px-2 py-1 hover:outline hover:outline-1 hover:outline-white/30 rounded transition-all whitespace-nowrap text-white"
            >
              Sports & Outdoors
            </Link>
            <Link
              to="/help"
              className="px-2 py-1 hover:outline hover:outline-1 hover:outline-white/30 rounded transition-all whitespace-nowrap ml-auto text-white"
            >
              Customer Service
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden bg-[#131921] pb-2 px-3">
        <form onSubmit={handleSearch}>
          <div className="relative flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-9 px-2 rounded-l-md rounded-r-none border-r border-border bg-gray-100 hover:bg-gray-200 text-foreground text-xs shrink-0 flex items-center"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-[300px] overflow-y-auto">
                {searchDepartments.map((dept) => (
                  <DropdownMenuItem
                    key={dept.value}
                    onClick={() => setSelectedDepartment(dept.value)}
                    className={cn(
                      selectedDepartment === dept.value ? "bg-[#e7e7e7] text-primary" : "",
                      "hover:bg-[#e7e7e7] hover:text-primary focus:bg-[#e7e7e7] focus:text-primary"
                    )}
                  >
                    {dept.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              type="search"
              placeholder="Search SwiftCart"
              className="flex-1 h-9 pl-3 pr-10 rounded-none border-0 bg-background text-foreground placeholder:text-muted-foreground text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-9 w-9 rounded-l-none rounded-r-md bg-[#dc2626] hover:bg-[#b91c1c] text-foreground shrink-0"
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