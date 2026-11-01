import { ChatMessage } from './chat-message'
import type { Message } from './demo'

interface Props {
  messages: Message[]
  isStreaming: boolean
  isAnimated: boolean
  isOffline: boolean
  onRetry: () => void
  onToggleTask: (messageId: string, index: number, done: boolean) => void
}

export const Conversation = ({
  messages,
  isStreaming,
  isAnimated,
  isOffline,
  onRetry,
  onToggleTask
}: Props) => (
  <section className="tamizhi-conversation" aria-label="Conversation">
    {messages.map((message, index) => (
      <ChatMessage
        key={message.id}
        message={message}
        isStreaming={isStreaming && index === messages.length - 1}
        isAnimated={isAnimated}
        canRetry={!isOffline && !isStreaming && index === messages.length - 1}
        onRetry={onRetry}
        onToggleTask={onToggleTask}
      />
    ))}
  </section>
)
