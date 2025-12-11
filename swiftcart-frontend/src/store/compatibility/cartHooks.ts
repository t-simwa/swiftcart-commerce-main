/**
 * Compatibility hooks for gradual migration from Context API to Redux
 * These hooks provide the same interface as the old Context API hooks
 * but use Redux under the hood
 */
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  toggleCart,
  setCartOpen,
  selectCartItems,
  selectCartIsOpen,
  selectTotalItems,
  selectTotalPrice,
} from '../slices/cartSlice';
import { Product } from '@/types/product';
import { toast } from '@/hooks/use-toast';

// Helper function to get a unique identifier for a product
function getProductId(product: Product): string {
  return product._id || product.id || product.slug;
}

/**
 * Redux-based cart hook that matches the Context API interface
 */
export function useCartRedux() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const isOpen = useAppSelector(selectCartIsOpen);
  const totalItems = useAppSelector(selectTotalItems);
  const totalPrice = useAppSelector(selectTotalPrice);

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock < quantity) {
      toast({
        title: 'Insufficient stock',
        description: `Only ${product.stock} items available`,
        variant: 'destructive',
      });
      return;
    }
    dispatch(addItem({ product, quantity }));
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
    });
  };

  const removeFromCart = (productId: string) => {
    dispatch(removeItem(productId));
    toast({
      title: 'Removed from cart',
      description: 'Item has been removed from your cart',
    });
  };

  const updateQuantityHandler = (productId: string, quantity: number) => {
    dispatch(updateQuantity({ productId, quantity }));
  };

  const clearCartHandler = () => {
    dispatch(clearCart());
  };

  const toggleCartHandler = () => {
    dispatch(toggleCart());
  };

  const setCartOpenHandler = (open: boolean) => {
    dispatch(setCartOpen(open));
  };

  return {
    state: { items, isOpen },
    dispatch,
    addToCart,
    removeFromCart,
    updateQuantity: updateQuantityHandler,
    clearCart: clearCartHandler,
    toggleCart: toggleCartHandler,
    setCartOpen: setCartOpenHandler,
    totalItems,
    totalPrice,
  };
}

