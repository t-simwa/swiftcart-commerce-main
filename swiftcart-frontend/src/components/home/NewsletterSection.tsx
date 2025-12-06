import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      toast.success("Thanks for subscribing!", {
        description: "You'll receive our best deals and updates.",
      });
      setEmail("");
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <section className="py-10 md:py-16 bg-foreground text-background">
      <div className="container-wide">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 mb-5">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          
          <h2 className="text-lg md:text-xl font-medium mb-3">
            Get Exclusive Deals & Updates
          </h2>
          <p className="text-background/70 text-sm md:text-base mb-6 max-w-md mx-auto">
            Subscribe to our newsletter and be the first to know about new arrivals, special offers, and exclusive discounts.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-background text-foreground placeholder:text-muted-foreground border-0 pr-4"
                required
              />
            </div>
            <Button 
              type="submit" 
              variant="hero" 
              className="h-12 px-6 font-medium"
              disabled={isSubmitted}
            >
              {isSubmitted ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Subscribed!
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </form>

          <p className="text-xs text-background/50 mt-4">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}