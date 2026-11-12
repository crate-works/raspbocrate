import { createRouter, ErrorComponent } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import * as TanstackQuery from './integrations/tanstack-query/root-provider';

import { routeTree } from './routeTree.gen';

export const getRouter = () => {
  const rqContext = TanstackQuery.getContext();

  const router = createRouter({
    routeTree,
    context: { ...rqContext },
    defaultPreload: 'intent',
    // Query owns caching, so always run loaders and let it decide whether to fetch.
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient: rqContext.queryClient,
  });

  return router;
};
