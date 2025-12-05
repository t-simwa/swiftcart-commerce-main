import { Link } from "react-router-dom";
import { ChevronUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-foreground text-background/90">
      {/* Back to top */}
      <button 
        onClick={scrollToTop}
        className="w-full py-3.5 bg-secondary-foreground/80 hover:bg-secondary-foreground text-sm font-medium text-background flex items-center justify-center gap-1 transition-colors"
      >
        <ChevronUp className="h-4 w-4" />
        Back to top
      </button>

      {/* Main Footer Links */}
      <div className="border-b border-background/10">
        <div className="container-wide py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {/* Get to Know Us */}
            <div>
              <h3 className="font-bold text-background mb-4 text-sm">Get to Know Us</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/about" className="text-background/75 hover:text-background hover:underline transition-colors">
                    About ShopHub
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Press Releases
                  </Link>
                </li>
                <li>
                  <Link to="/investors" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Investor Relations
                  </Link>
                </li>
              </ul>
            </div>

            {/* Make Money with Us */}
            <div>
              <h3 className="font-bold text-background mb-4 text-sm">Make Money with Us</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/sell" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Sell on ShopHub
                  </Link>
                </li>
                <li>
                  <Link to="/affiliate" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Become an Affiliate
                  </Link>
                </li>
                <li>
                  <Link to="/advertise" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Advertise Your Products
                  </Link>
                </li>
                <li>
                  <Link to="/fulfillment" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Fulfillment by ShopHub
                  </Link>
                </li>
              </ul>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="font-bold text-background mb-4 text-sm">Payment Methods</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/mpesa" className="text-background/75 hover:text-background hover:underline transition-colors">
                    M-Pesa
                  </Link>
                </li>
                <li>
                  <Link to="/cards" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Credit & Debit Cards
                  </Link>
                </li>
                <li>
                  <Link to="/gift-cards" className="text-background/75 hover:text-background hover:underline transition-colors">
                    ShopHub Gift Cards
                  </Link>
                </li>
                <li>
                  <Link to="/pay-later" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Pay Later Options
                  </Link>
                </li>
              </ul>
            </div>

            {/* Let Us Help You */}
            <div>
              <h3 className="font-bold text-background mb-4 text-sm">Let Us Help You</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/account" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Your Account
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Your Orders
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Shipping Rates & Policies
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Returns & Refunds
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-background/75 hover:text-background hover:underline transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Section */}
      <div className="border-b border-background/10">
        <div className="container-wide py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <Link to="/" className="flex items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
                <span className="text-sm font-black text-primary-foreground">S</span>
              </div>
              <span className="text-base font-bold text-background">
                Shop<span className="text-primary">Hub</span>
              </span>
            </Link>
            <div className="flex items-center gap-4 text-xs text-background/70">
              <span>🇰🇪 Kenya</span>
              <span>English</span>
              <span>KSh (KES)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="bg-foreground/95">
        <div className="container-wide py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-background/60">
            <Link to="/terms" className="hover:text-background hover:underline transition-colors">
              Conditions of Use
            </Link>
            <Link to="/privacy" className="hover:text-background hover:underline transition-colors">
              Privacy Notice
            </Link>
            <Link to="/cookies" className="hover:text-background hover:underline transition-colors">
              Cookie Preferences
            </Link>
            <span className="text-background/50">© 2024 ShopHub Kenya</span>
          </div>
        </div>
      </div>
    </footer>
  );
}