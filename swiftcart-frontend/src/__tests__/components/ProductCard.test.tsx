import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/types/product';
import { CartProvider } from '@/context/CartContext';

// Mock the cart context
const mockAddToCart = jest.fn();

jest.mock('@/context/CartContext', () => ({
  ...jest.requireActual('@/context/CartContext'),
  useCart: () => ({
    addToCart: mockAddToCart,
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    items: [],
    totalItems: 0,
    totalPrice: 0,
    toggleCart: jest.fn(),
  }),
}));

const mockProduct: Product = {
  _id: '1',
  name: 'Test Product',
  slug: 'test-product',
  description: 'Test description',
  price: 99.99,
  originalPrice: 129.99,
  category: 'electronics',
  stock: 10,
  images: ['https://example.com/image.jpg'],
  featured: true,
  rating: 4.5,
  reviewsCount: 100,
  sku: 'SKU001',
  brand: 'Test Brand',
  lowStockThreshold: 5,
};

describe('ProductCard', () => {
  beforeEach(() => {
    mockAddToCart.mockClear();
  });

  it('renders product information correctly', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$129.99')).toBeInTheDocument();
  });

  it('displays discount percentage when original price exists', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    // Discount should be approximately 23% (30/130)
    expect(screen.getByText(/-23%/i)).toBeInTheDocument();
  });

  it('calls addToCart when add to cart button is clicked', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('disables add to cart button when product is out of stock', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    
    render(
      <CartProvider>
        <ProductCard product={outOfStockProduct} />
      </CartProvider>
    );

    const addToCartButton = screen.getByRole('button', { name: /out of stock/i });
    expect(addToCartButton).toBeDisabled();
  });

  it('navigates to product detail page when product is clicked', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    const productLink = screen.getByRole('link', { name: /test product/i });
    expect(productLink).toHaveAttribute('href', '/products/test-product');
  });
});

