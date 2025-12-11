import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1500&h=600&fit=crop&q=85",
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
      <div className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden group">
        {/* Gradient Overlays for Arrow Contrast */}
        <div className="absolute left-0 top-0 w-[10%] h-full bg-gradient-to-r from-black/8 to-transparent z-[5] pointer-events-none" />
        <div className="absolute right-0 top-0 w-[10%] h-full bg-gradient-to-l from-black/8 to-transparent z-[5] pointer-events-none" />

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
                      <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-background mb-4 md:mb-8 drop-shadow-lg leading-tight">
                        {slide.title}
                      </h2>
                      <div className="flex flex-col items-center mb-12 md:mb-0">
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

        {/* Navigation Arrows - Ultra-Minimalist (Desktop only, mobile uses swipe) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            goToPrevious();
          }}
          className="absolute left-[10px] md:left-[20px] top-1/2 -translate-y-1/2 z-[10] w-[50px] h-[50px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:left-[8px] md:hover:left-[18px] hidden md:flex"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-[32px] w-[32px] text-white stroke-[2px] group-hover:stroke-[3px] transition-all duration-200" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))' }} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            goToNext();
          }}
          className="absolute right-[10px] md:right-[20px] top-1/2 -translate-y-1/2 z-[10] w-[50px] h-[50px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:right-[8px] md:hover:right-[18px] hidden md:flex"
          aria-label="Next slide"
        >
          <ChevronRight className="h-[32px] w-[32px] text-white stroke-[2px] group-hover:stroke-[3px] transition-all duration-200" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))' }} />
        </button>

        {/* Thin Line/Pill Dots Indicator */}
        <div className="absolute bottom-[40px] md:bottom-[30px] left-1/2 -translate-x-1/2 flex gap-[6px] z-[10] items-center">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                goToSlide(index);
              }}
              className="relative flex items-center justify-center"
              style={{ 
                minWidth: '44px', 
                minHeight: '44px',
                width: 'auto',
                height: 'auto'
              }}
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className={`block h-[2px] md:h-[3px] rounded-full transition-all duration-300 ease-in-out flex-shrink-0 ${
                  index === currentIndex
                    ? "w-[24px] md:w-[30px] bg-primary"
                    : "w-[10px] bg-primary/30"
                }`}
              />
              <span className="sr-only">Slide {index + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

