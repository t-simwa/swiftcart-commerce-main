import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  link: string;
}

const slides: CarouselSlide[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1500&h=600&fit=crop&q=85",
    title: "Free Delivery Nationwide on Orders Over KSh 5,000",
    link: "/products",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1500&h=600&fit=crop&q=85",
    title: "Latest Electronics & Smartphones | Best Prices in Kenya",
    link: "/products?category=electronics",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1500&h=600&fit=crop&q=85",
    title: "Fashion & Style | New Arrivals Every Week",
    link: "/products?category=fashion",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1500&h=600&fit=crop&q=85",
    title: "Home & Living Essentials | Transform Your Space",
    link: "/products?category=home-living",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1461896836934-0fe2bd9d3089?w=1500&h=600&fit=crop&q=85",
    title: "Flash Deals | Up to 50% Off | Limited Time Only",
    link: "/deals",
  },
];

export function AmazonHeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative w-full bg-background mb-4">
      <div className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
        {/* Slides */}
        <div className="relative h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="relative h-full w-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover"
                />
                {/* Overlay with gradient for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
                {/* Title overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="container-wide px-4 md:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-background mb-8 drop-shadow-lg leading-loose">
                        {slide.title}
                      </h2>
                      <div className="flex flex-col items-center">
                        <Link
                          to={slide.link}
                          className="inline-flex items-center px-6 py-3 bg-primary text-background text-sm md:text-base font-semibold rounded-md shadow-lg hover:bg-primary/90 transition-colors"
                        >
                          Shop Now
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 hover:bg-background shadow-md z-10"
          onClick={(e) => {
            e.preventDefault();
            goToPrevious();
          }}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 hover:bg-background shadow-md z-10"
          onClick={(e) => {
            e.preventDefault();
            goToNext();
          }}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                goToSlide(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-background/60 hover:bg-background/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

