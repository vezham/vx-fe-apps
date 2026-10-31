import { createFileRoute, notFound } from '@tanstack/react-router'

// vx-bot/HACK: Give SPA-shell hydration a pending child match before resolving
// unknown URLs. Root-only unmatched URLs currently hydrate as 404 over loading HTML.
export const Route = createFileRoute('/$')({
  beforeLoad: () => {
    throw notFound()
  }
})
