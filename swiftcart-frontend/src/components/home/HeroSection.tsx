import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, Smartphone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-secondary to-background overflow-hidden">
      <div className="container-wide py-6 md:py-10">
        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column - Main Hero */}
          <div className="lg:col-span-8">
            <div className="relative h-[280px] md:h-[400px] rounded-lg overflow-hidden bg-gradient-to-br from-foreground/5 to-foreground/10">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop"
                alt="Shop the latest collections"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
              <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-center max-w-lg">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/20 rounded-full px-3 py-1 w-fit mb-4 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Free Shipping Over KSh 5,000
                </span>
                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-background mb-3 leading-tight">
                  Discover Quality Products at Great Prices
                </h1>
                <p className="text-background/80 text-sm md:text-base mb-6 max-w-md text-body-light">
                  Shop electronics, fashion, home & more with secure M-Pesa payments and fast delivery across Kenya.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="hero" size="lg" asChild className="font-medium">
                    <Link to="/products">
                      Shop Now
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="bg-background/10 border-background/30 text-background hover:bg-background/20">
                    <Link to="/deals">Today's Deals</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Promo Cards */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
            <Link 
              to="/products?category=electronics" 
              className="group relative h-[140px] md:h-[192px] rounded-lg overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
                alt="Electronics"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-foreground/10" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-background text-lg">Electronics</h3>
                <p className="text-background/80 text-sm">Up to 40% off</p>
              </div>
            </Link>
            <Link 
              to="/products?category=fashion" 
              className="group relative h-[140px] md:h-[192px] rounded-lg overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop"
                alt="Fashion"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-foreground/10" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-background text-lg">Fashion</h3>
                <p className="text-background/80 text-sm">New arrivals</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Trust Features Strip */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="flex items-center gap-3 p-3 md:p-4 rounded-lg bg-card border border-border">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground truncate">Fast Delivery</p>
              <p className="text-xs text-muted-foreground truncate">Same-day in Nairobi</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 md:p-4 rounded-lg bg-card border border-border">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-success/10">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">Secure Payment</p>
              <p className="text-xs text-muted-foreground truncate">M-Pesa & Cards</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 md:p-4 rounded-lg bg-card border border-border">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-info/10">
              <Smartphone className="h-5 w-5 text-info" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">Easy Returns</p>
              <p className="text-xs text-muted-foreground truncate">30-day guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 md:p-4 rounded-lg bg-card border border-border">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">24/7 Support</p>
              <p className="text-xs text-muted-foreground truncate">Always available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}