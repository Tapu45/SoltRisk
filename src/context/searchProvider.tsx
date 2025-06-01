"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: (term?: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);
  
  // Initialize search term from URL query parameter
  const [searchTerm, setSearchTerm] = useState(() => {
    return searchParams.get("q") || "";
  });

  // Handle search submission
  const handleSearch = useCallback((term?: string) => {
    const query = term !== undefined ? term : searchTerm;
    if (!query.trim()) {
      // If empty query, remove the search parameter from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      
      // Only update if we actually had a search param before
      if (searchParams.has("q")) {
        router.push(`${pathname}?${params.toString()}`);
      }
      return;
    }

    setIsSearching(true);
    
    // Create new URL with search parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", query);
    router.push(`${pathname}?${params.toString()}`);
    
    // We'd typically set isSearching back to false after results load
    // For demo purposes we'll use a timeout
    setTimeout(() => setIsSearching(false), 500);
  }, [searchTerm, router, pathname, searchParams]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  return (
    <SearchContext.Provider 
      value={{ 
        searchTerm, 
        setSearchTerm, 
        handleSearch, 
        clearSearch,
        isSearching 
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}