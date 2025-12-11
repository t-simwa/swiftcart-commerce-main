import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, X, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { formatPrice } from '@/lib/utils';
import { getSearchHistory, removeFromSearchHistory, SearchHistoryItem } from '@/utils/searchHistory';

interface SearchSuggestionsProps {
  query: string;
  suggestions: string[];
  products: Array<{
    name: string;
    slug: string;
    image: string;
    price: number;
    category: string;
  }>;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (query: string) => void;
  selectedDepartment?: string;
}

export function SearchSuggestions({
  query,
  suggestions,
  products,
  isLoading,
  isOpen,
  onClose,
  onSelect,
  selectedDepartment,
}: SearchSuggestionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchHistory = getSearchHistory();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking on a link or button inside the container
      if (target.tagName === 'A' || target.closest('a') || target.closest('button')) {
        return;
      }
      if (containerRef.current && !containerRef.current.contains(target)) {
        onClose();
      }
    };

    if (isOpen) {
      // Use click instead of mousedown to allow link navigation
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasQuery = query.trim().length >= 2;
  const hasSuggestions = suggestions.length > 0;
  const hasProducts = products.length > 0;
  const hasHistory = searchHistory.length > 0;
  const showContent = hasQuery || hasHistory;

  if (!showContent && !isLoading) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[600px] overflow-y-auto"
    >
      {isLoading && hasQuery && (
        <div className="p-4 text-center text-sm text-gray-500">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
          Searching...
        </div>
      )}

      {/* Search Suggestions */}
      {hasQuery && hasSuggestions && (
        <div className="p-2 border-b border-gray-100">
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Suggestions</div>
          {suggestions.map((suggestion, index) => (
            <button
              type="button"
              key={index}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(suggestion);
                onClose();
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-sm flex items-center gap-2 text-sm text-gray-900 cursor-pointer"
            >
              <Search className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Product Results */}
      {hasQuery && hasProducts && (
        <div className="p-2 border-b border-gray-100">
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Products</div>
          {products.map((product) => (
            <Link
              key={product.slug}
              to={`/products/${product.slug}`}
              onClick={() => {
                // Close dropdown - Link will handle navigation
                onClose();
              }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-sm cursor-pointer"
            >
              <OptimizedImage
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-contain rounded"
                aspectRatio="square"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                <div className="text-xs text-gray-500">{product.category}</div>
              </div>
              <div className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Recent Searches */}
      {!hasQuery && hasHistory && (
        <div className="p-2">
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Recent Searches
            </span>
          </div>
          {searchHistory.map((item: SearchHistoryItem, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-sm group"
            >
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(item.query);
                  onClose();
                }}
                className="flex-1 text-left text-sm text-gray-900 flex items-center gap-2 cursor-pointer"
              >
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{item.query}</span>
                {item.category && (
                  <span className="text-xs text-gray-500">in {item.category}</span>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromSearchHistory(item.query);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                aria-label="Remove from history"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Popular Searches (placeholder - can be enhanced with backend) */}
      {!hasQuery && !hasHistory && (
        <div className="p-4 text-center text-sm text-gray-500">
          <TrendingUp className="h-5 w-5 mx-auto mb-2 text-gray-400" />
          <p>Start typing to search</p>
          <p className="text-xs mt-1">Popular: Laptops, Phones, Headphones</p>
        </div>
      )}

      {/* No Results */}
      {hasQuery && !isLoading && !hasSuggestions && !hasProducts && (
        <div className="p-4 text-center text-sm text-gray-500">
          <p>No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}

