import { createFileRoute } from '@tanstack/react-router'

import { SettingsRoute, validateSearch } from '@vezham/react/pages/settings'

import { controlCenter } from '@generated/navigation'

export const Route = createFileRoute('/settings')({
  validateSearch,
  component: () => <SettingsRoute controlCenter={controlCenter} />
})
