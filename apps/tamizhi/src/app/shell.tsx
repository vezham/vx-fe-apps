import { createRouter } from '@vezham/start/router/tanstack'

import { routeTree } from '@src/routeTree.gen'

import './global.css'

// vx-bot/NOTE: Create a new router instance
export const createAppRouter = () => createRouter({ routeTree })

// vx-bot/NOTE: Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
