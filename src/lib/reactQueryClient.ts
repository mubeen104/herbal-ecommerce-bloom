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
            if (error.message?.includes('42703')) return false;
            if (error.message?.includes('42P01')) return false;
            if (error.message?.includes('validation')) return false;
          }
          return failureCount < 3;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 3 * 60 * 1000, // 3 minutes - faster updates
        gcTime: 5 * 60 * 1000, // 5 minutes cache retention
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: (failureCount, error) => {
          if (error instanceof Error) {
            if (error.message?.includes('permission denied')) return false;
            if (error.message?.includes('validation')) return false;
            if (error.message?.includes('constraint violation')) return false;
          }
          return failureCount < 2;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
      },
    },
  });
};

// Create a singleton instance
export const queryClient = createQueryClient();

// Export types for use throughout the app
export type { QueryClient };