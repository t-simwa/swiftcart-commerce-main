import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

// Mock hooks
jest.mock('@/context/CartContext', () => ({
  ...jest.requireActual('@/context/CartContext'),
  useCart: () => ({
    totalItems: 5,
    toggleCart: jest.fn(),
  }),
}));

jest.mock('@/context/AuthContext', () => ({
  ...jest.requireActual('@/context/AuthContext'),
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    logout: jest.fn(),
  }),
}));

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Header />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Header', () => {
  it('renders logo', () => {
    renderHeader();
    expect(screen.getByText(/swiftcart/i)).toBeInTheDocument();
  });

  it('renders search bar', () => {
    renderHeader();
    expect(screen.getByPlaceholderText(/search swiftcart/i)).toBeInTheDocument();
  });

  it('displays cart with item count', () => {
    renderHeader();
    expect(screen.getByText(/cart/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows sign in button when user is not authenticated', () => {
    renderHeader();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });
});

