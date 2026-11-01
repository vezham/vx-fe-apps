import { Add, TrashBinMinimalistic, VezhamTamizhi } from '@vezham/icons-react'
import { Button } from '@vezham/react-v3'

import { EXAMPLES } from './demo'
import type { Conversation, ExampleChat } from './demo'
import { IconButton } from './icon-button'

interface Props {
  conversations: Conversation[]
  activeId: string | null
  isSaved: boolean
  onNewChat: () => void
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
  onExample: (example: ExampleChat) => void
}

export const Sidebar = ({
  conversations,
  activeId,
  isSaved,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onExample
}: Props) => (
  <div className="tamizhi-sidebar">
    <div className="tamizhi-sidebar__brand">
      <VezhamTamizhi size={32} aria-hidden="true" />
      <span>Tamizhi</span>
    </div>
    <Button
      size="lg"
      variant="primary"
      className="tamizhi-sidebar__new"
      onPress={onNewChat}>
      <Add size={17} aria-hidden="true" />
      New chat
    </Button>
    <div className="tamizhi-sidebar__scroll">
      {conversations.length > 0 && (
        <nav
          aria-label="Saved conversations"
          className="tamizhi-sidebar__group">
          <h2>Chats</h2>
          {conversations.map(chat => (
            <div
              key={chat.id}
              className="tamizhi-sidebar__chat"
              data-active={chat.id === activeId}>
              <Button
                variant="ghost"
                className="tamizhi-sidebar__chat-link"
                aria-current={chat.id === activeId ? 'page' : undefined}
                onPress={() => onSelectChat(chat.id)}>
                <span>{chat.title}</span>
              </Button>
              <IconButton
                label={`Delete ${chat.title}`}
                size="sm"
                onPress={() => onDeleteChat(chat.id)}>
                <TrashBinMinimalistic size={14} aria-hidden="true" />
              </IconButton>
            </div>
          ))}
        </nav>
      )}
      <nav
        aria-label="Example conversations"
        className="tamizhi-sidebar__group">
        <h2>Examples</h2>
        {EXAMPLES.map(example => (
          <Button
            key={example.id}
            variant="ghost"
            className="tamizhi-sidebar__example"
            onPress={() => onExample(example)}>
            <span
              className="tamizhi-sidebar__dot"
              data-persona={example.persona}
            />
            {example.title}
          </Button>
        ))}
      </nav>
    </div>
    <p className="tamizhi-sidebar__note">
      {isSaved ? 'Saved in this browser' : 'Session only · Storage unavailable'}
    </p>
  </div>
)
