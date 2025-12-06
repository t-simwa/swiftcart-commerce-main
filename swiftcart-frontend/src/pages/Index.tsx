import { useQuery } from "@tanstack/react-query";
import { AmazonHeroCarousel } from "@/components/home/AmazonHeroCarousel";
import { AmazonCategorySection } from "@/components/home/AmazonCategorySection";
import { AmazonProductCarousel } from "@/components/home/AmazonProductCarousel";
import { WalmartDealsSection } from "@/components/home/WalmartDealsSection";
import { CategoryCircleCarousel } from "@/components/home/CategoryCircleCarousel";
import { departmentCategories } from "@/data/categories";
import { apiClient } from "@/lib/api";

const Index = () => {
  // Fetch featured products
  const { data: featuredData } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const response = await apiClient.getProducts({
        page: 1,
        limit: 20,
        featured: true,
        sort: "popular",
      });
      return response.data;
    },
  });

  // Fetch best sellers
  const { data: bestSellersData } = useQuery({
    queryKey: ["products", "best-sellers"],
    queryFn: async () => {
      const response = await apiClient.getProducts({
        page: 1,
        limit: 20,
        sort: "popular",
      });
      return response.data;
    },
  });

  // Fetch electronics products
  const { data: electronicsData } = useQuery({
    queryKey: ["products", "electronics"],
    queryFn: async () => {
      const response = await apiClient.getProducts({
        page: 1,
        limit: 20,
        category: "electronics",
        sort: "popular",
      });
      return response.data;
    },
  });

  // Fetch fashion products
  const { data: fashionData } = useQuery({
    queryKey: ["products", "fashion"],
    queryFn: async () => {
      const response = await apiClient.getProducts({
        page: 1,
        limit: 20,
        category: "fashion",
        sort: "popular",
      });
      return response.data;
    },
  });

  // Fetch home & living products
  const { data: homeData } = useQuery({
    queryKey: ["products", "home-living"],
    queryFn: async () => {
      const response = await apiClient.getProducts({
        page: 1,
        limit: 20,
        category: "home-living",
        sort: "popular",
      });
      return response.data;
    },
  });

  // Fetch sports products
  const { data: sportsData } = useQuery({
    queryKey: ["products", "sports"],
    queryFn: async () => {
      const response = await apiClient.getProducts({
        page: 1,
        limit: 20,
        category: "sports",
        sort: "popular",
      });
      return response.data;
    },
  });

  // Fetch deals products (products with discounts/originalPrice)
  const { data: dealsData } = useQuery({
    queryKey: ["deals", "home"],
    queryFn: async () => {
      const response = await apiClient.getDeals({
        page: 1,
        limit: 30,
        sort: "discount-desc",
      });
      return response.data;
    },
  });

  const featuredProducts = featuredData?.products || [];
  const bestSellers = bestSellersData?.products || [];
  const electronicsProducts = electronicsData?.products || [];
  const fashionProducts = fashionData?.products || [];
  const homeProducts = homeData?.products || [];
  const sportsProducts = sportsData?.products || [];
  
  // Get deals products from deals API
  const dealsProducts = dealsData?.products || [];

  const homeEssentialsCategories = [
    {
      id: "1",
      name: "Kitchen & Dining",
      image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop",
      link: "/products?category=home-living&search=kitchen",
    },
    {
      id: "2",
      name: "Home Decor",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      link: "/products?category=home-living&search=decor",
    },
    {
      id: "3",
      name: "Bedding",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop",
      link: "/products?category=home-living&search=bedding",
    },
    {
      id: "4",
      name: "Storage",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=300&fit=crop",
      link: "/products?category=home-living&search=storage",
    },
  ];

  return (
    <main className="bg-secondary/30 min-h-screen">
      {/* Hero Carousel */}
      <AmazonHeroCarousel />

      {/* Cyber Monday Deals & more - Walmart Style Section */}
      <WalmartDealsSection
        products={dealsProducts.slice(0, 20)}
        title="Shop all Deals & more"
        subtitle="Up to 50% off"
        viewAllLink="/deals"
        viewAllText="View all"
      />

      {/* Shop by Category - Circular Carousel */}
      <CategoryCircleCarousel
        title="Shop by category"
        categories={departmentCategories}
        seeMoreLink="/products"
        seeMoreText="See all categories"
      />

      {/* Home Essentials */}
      <AmazonCategorySection
        title="Shop for your home essentials"
        categories={homeEssentialsCategories}
        seeMoreLink="/products?category=home-living"
        seeMoreText="Discover more in Home"
        columns={4}
      />

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <AmazonProductCarousel
          title="Best Sellers"
          products={bestSellers.slice(0, 15)}
          seeMoreLink="/products?sort=popular"
          seeMoreText="See more"
        />
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <AmazonProductCarousel
          title="Featured Products"
          products={featuredProducts.slice(0, 15)}
          seeMoreLink="/products?featured=true"
          seeMoreText="See more"
        />
      )}

      {/* Electronics */}
      {electronicsProducts.length > 0 && (
        <AmazonProductCarousel
          title="Popular in Electronics"
          products={electronicsProducts.slice(0, 15)}
          seeMoreLink="/products?category=electronics"
          seeMoreText="See more"
        />
      )}

      {/* Fashion */}
      {fashionProducts.length > 0 && (
        <AmazonProductCarousel
          title="Fashion for you"
          products={fashionProducts.slice(0, 15)}
          seeMoreLink="/products?category=fashion"
          seeMoreText="See more"
        />
      )}

      {/* Home & Living */}
      {homeProducts.length > 0 && (
        <AmazonProductCarousel
          title="Home & Living essentials"
          products={homeProducts.slice(0, 15)}
          seeMoreLink="/products?category=home-living"
          seeMoreText="See more"
        />
      )}

      {/* Sports */}
      {sportsProducts.length > 0 && (
        <AmazonProductCarousel
          title="Sports & Outdoors"
          products={sportsProducts.slice(0, 15)}
          seeMoreLink="/products?category=sports"
          seeMoreText="See more"
        />
      )}

      {/* Deals Section */}
      <AmazonCategorySection
        title="Save more on deals"
        categories={[
          {
            id: "1",
            name: "Electronics Deals",
            image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
            link: "/deals?category=electronics",
          },
          {
            id: "2",
            name: "Fashion Deals",
            image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
            link: "/deals?category=fashion",
          },
          {
            id: "3",
            name: "Home Deals",
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
            link: "/deals?category=home-living",
          },
          {
            id: "4",
            name: "Sports Deals",
            image: "https://images.unsplash.com/photo-1461896836934-0fe2bd9d3089?w=400&h=300&fit=crop",
            link: "/deals?category=sports",
          },
        ]}
        seeMoreLink="/deals"
        seeMoreText="Discover more deals"
        columns={4}
      />
    </main>
  );
};

export default Index;
