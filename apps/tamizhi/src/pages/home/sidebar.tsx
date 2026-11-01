import type { AppNavigationItem } from '@vezham/react'

import { EXAMPLES } from './demo'
import type { Conversation } from './demo'

export const getSidebarItems = (
  conversations: Conversation[]
): AppNavigationItem[] => [
  {
    key: 'new-chat',
    title: 'New chat',
    href: '/chat/new',
    icon: 'vx:plus'
  },
  ...conversations.map(chat => ({
    key: `chat-${chat.id}`,
    title: chat.title,
    href: `/chat/${chat.id}`,
    icon: 'vx:chat-round-dots'
  })),
  {
    key: 'examples',
    title: 'Examples',
    childrenDisplay: 'sidebar',
    children: EXAMPLES.map(example => ({
      key: `example-${example.id}`,
      title: example.title,
      href: `/chat/example-${example.id}`,
      icon: 'vx:chat-round-dots'
    }))
  }
]
