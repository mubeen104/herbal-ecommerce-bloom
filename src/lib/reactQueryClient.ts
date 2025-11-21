import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry on validation errors or function not found
          if (error instanceof Error) {
            if (error.message?.includes('permission denied')) return false;
            if (error.message?.includes('function not found')) return false;
            if (error.message?.includes('42703')) return false; // Column does not exist
            if (error.message?.includes('42P01')) return false; // Table does not exist
            if (error.message?.includes('validation')) return false;
          }

          // Retry on network/database errors up to 3 times
          return failureCount < 3;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
        staleTime: 5 * 60 * 1000, // 5 minutes default
        gcTime: 10 * 60 * 1000, // 10 minutes default (was cacheTime)
        refetchOnWindowFocus: false, // Don't refetch on window focus by default
        refetchOnReconnect: true, // Do refetch on reconnect
      },
      mutations: {
        retry: (failureCount, error) => {
          // Don't retry mutations on validation errors
          if (error instanceof Error) {
            if (error.message?.includes('permission denied')) return false;
            if (error.message?.includes('validation')) return false;
            if (error.message?.includes('constraint violation')) return false;
          }

          // Retry mutations up to 2 times
          return failureCount < 2;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff, max 10s
      },
    },
  });
};

// Create a singleton instance
export const queryClient = createQueryClient();

// Export types for use throughout the app
export type { QueryClient };