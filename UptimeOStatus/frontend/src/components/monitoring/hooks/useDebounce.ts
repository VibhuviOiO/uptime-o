import { useState, useEffect, useCallback } from 'react';

interface UseDebounceProps<T> {
  value: T;
  delay: number;
}

export function useDebounce<T>({ value, delay }: UseDebounceProps<T>): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);
    
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(handler);
      setIsDebouncing(false);
    };
  }, [value, delay]);

  return [debouncedValue, isDebouncing];
}

// Alternative hook for debounced callbacks
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const handler = setTimeout(() => {
        callback(...args);
      }, delay);
      
      return () => clearTimeout(handler);
    },
    [callback, delay]
  );

  return debouncedCallback as T;
}