import { Add, TrashBinMinimalistic } from '@vezham/icons-react'
import { Button } from '@vezham/react-v3'

import { Companion } from './companion'
import { EXAMPLES } from './demo'
import type { Conversation, Persona } from './demo'
import { IconButton } from './icon-button'

interface Props {
  conversations: Conversation[]
  activeId: string | null
  isSaved: boolean
  onNewChat: () => void
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
  onExample: (prompt: string, persona: Persona) => void
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
      <Companion size="small" isAnimated={false} />
      <span>Tamizhi</span>
    </div>
    <Button
      variant="ghost"
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
            key={example.persona}
            variant="ghost"
            className="tamizhi-sidebar__example"
            onPress={() => onExample(example.prompt, example.persona)}>
            <span
              className="tamizhi-sidebar__dot"
              data-persona={example.persona}
            />
            {example.title}
          </Button>
        ))}
        {[
          ['Quick dinner', 'Suggest a quick dinner recipe with eggs.'],
          [
            'A playlist for focus',
            'Suggest a music playlist for a focused afternoon.'
          ],
          ['A happier basil plant', 'Help me care for a basil plant.'],
          ['Find the bug', 'Help me debug a TypeError in my app.'],
          ['A simple budget', 'Help me make a simple monthly budget.']
        ].map(([title, prompt]) => (
          <Button
            key={title}
            variant="ghost"
            className="tamizhi-sidebar__example"
            onPress={() => onExample(prompt, 'helper')}>
            <span className="tamizhi-sidebar__dot" />
            {title}
          </Button>
        ))}
      </nav>
    </div>
    <p className="tamizhi-sidebar__note">
      {isSaved ? 'Saved in this browser' : 'Session only · Storage unavailable'}
    </p>
  </div>
)
