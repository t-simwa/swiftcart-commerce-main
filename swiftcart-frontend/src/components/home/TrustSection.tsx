import { Truck, RotateCcw, Shield, Headphones, CreditCard, Package } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Fast, Free Delivery",
    description: "Free shipping on orders over KSh 5,000. Same-day delivery available in Nairobi.",
    color: "primary",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Changed your mind? Return within 30 days for a full refund. No questions asked.",
    color: "success",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Pay securely with M-Pesa, Visa, or Mastercard. Your data is always protected.",
    color: "info",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Got a question? Our friendly team is here to help around the clock.",
    color: "warning",
  },
];

const colorMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
};

export function TrustSection() {
  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Why Shop with ShopHub?
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Kenya's most trusted e-commerce platform with over 500+ happy customers
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group text-center p-6 rounded-xl bg-card border border-border hover:shadow-card-hover transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-4 ${colorMap[feature.color]} transition-transform group-hover:scale-110`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Payment Methods Banner */}
        <div className="mt-12 p-6 rounded-xl bg-secondary/50 border border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CreditCard className="h-6 w-6 text-success" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Secure Payment Options</h4>
                <p className="text-sm text-muted-foreground">Pay with confidence using your preferred method</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border border-border">
                <span className="text-success font-bold text-lg">M-Pesa</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border border-border">
                <span className="text-info font-bold">VISA</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border border-border">
                <span className="text-destructive font-bold">Mastercard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}