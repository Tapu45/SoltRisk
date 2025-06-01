"use client";

import { useMemo } from "react";
import { useSearch } from "../context/searchProvider";
import { useSearchParams } from "next/navigation";

export function usePageSearch<T>(items: T[], searchableFields: (keyof T)[]) {
  const { searchTerm } = useSearch();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q");
  
  // Use the URL param or the context value, with URL param taking precedence
  const effectiveSearchTerm = queryParam || searchTerm;
  
  // Use memoization instead of useState + useEffect
  const filteredItems = useMemo(() => {
    if (!effectiveSearchTerm) {
      return items;
    }

    const lowercasedTerm = effectiveSearchTerm.toLowerCase();
    
    return items.filter(item => {
      return searchableFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowercasedTerm);
        }
        if (typeof value === 'number') {
          return value.toString().includes(lowercasedTerm);
        }
        return false;
      });
    });
  }, [effectiveSearchTerm, items, searchableFields]);

  return {
    filteredItems,
    searchTerm: effectiveSearchTerm,
    isSearching: !!effectiveSearchTerm
  };
}