import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/pulse')({
  server: {
    handlers: {
      GET: async () => new Response('API: Hello World')
    }
  }
})
