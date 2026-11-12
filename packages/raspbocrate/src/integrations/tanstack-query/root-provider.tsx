import { QueryClient } from '@tanstack/react-query';

export function getContext() {
  const queryClient = new QueryClient({
    // Long enough to reuse hover-preloaded and SSR-hydrated data, short enough to notice a newly plugged-in drive.
    defaultOptions: { queries: { staleTime: 5_000 } },
  });
  return {
    queryClient,
  };
}
