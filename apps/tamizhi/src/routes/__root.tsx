import { createRootRoute } from '@tanstack/react-router'

import { AppLayout } from '@vezham/react/layouts/app'
import { createRootComponent } from '@vezham/start/tanstack'

import { appMenu, controlCenter, navigationItems } from '@generated/navigation'
import { tanstackHead, vxI18n } from '@generated/vx'

export const Route = createRootRoute({
  head: () => tanstackHead,
  component: createRootComponent({
    lang: vxI18n.defaultLanguage,
    children: (
      <AppLayout
        settings
        navigationItems={navigationItems}
        appMenu={appMenu}
        controlCenter={controlCenter}
        i18n={vxI18n}
      />
    )
  })
})
