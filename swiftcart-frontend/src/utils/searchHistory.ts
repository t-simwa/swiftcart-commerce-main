const SEARCH_HISTORY_KEY = 'swiftcart_search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  category?: string;
}

/**
 * Get search history from localStorage
 */
export function getSearchHistory(): SearchHistoryItem[] {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!history) return [];
    return JSON.parse(history) as SearchHistoryItem[];
  } catch (error) {
    console.error('Error reading search history:', error);
    return [];
  }
}

/**
 * Add a search query to history
 */
export function addToSearchHistory(query: string, category?: string): void {
  try {
    const history = getSearchHistory();
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) return;

    // Remove duplicate entries
    const filteredHistory = history.filter(
      (item) => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
    );

    // Add new item at the beginning
    const newItem: SearchHistoryItem = {
      query: trimmedQuery,
      timestamp: Date.now(),
      category,
    };

    const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving search history:', error);
  }
}

/**
 * Clear search history
 */
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
}

/**
 * Remove a specific item from search history
 */
export function removeFromSearchHistory(query: string): void {
  try {
    const history = getSearchHistory();
    const filteredHistory = history.filter(
      (item) => item.query.toLowerCase() !== query.toLowerCase()
    );
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error('Error removing from search history:', error);
  }
}

