import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface SearchSuggestion {
  suggestions: string[];
  products: Array<{
    name: string;
    slug: string;
    image: string;
    price: number;
    category: string;
  }>;
}

/**
 * Custom hook for fetching search suggestions
 * @param query - Search query string
 * @param enabled - Whether to fetch suggestions
 * @returns Search suggestions data and loading state
 */
export function useSearchSuggestions(query: string, enabled: boolean = true) {
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    // Only fetch if query is at least 2 characters
    setShouldFetch(enabled && query.trim().length >= 2);
  }, [query, enabled]);

  const { data, isLoading, error } = useQuery<SearchSuggestion>({
    queryKey: ['searchSuggestions', query],
    queryFn: async () => {
      const response = await apiClient.getSearchSuggestions({
        q: query.trim(),
        limit: 5,
      });
      return response.data || { suggestions: [], products: [] };
    },
    enabled: shouldFetch,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 60000, // Keep in cache for 1 minute
  });

  return {
    suggestions: data?.suggestions || [],
    products: data?.products || [],
    isLoading,
    error,
  };
}

