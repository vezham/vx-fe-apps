import { useState } from 'react'
import Markdown from 'react-markdown'

import { CheckRead, Copy, Refresh } from '@vezham/icons-react'
import { Card, Checkbox, Label } from '@vezham/react-v3'

import { Companion } from './companion'
import type { Message } from './demo'
import { IconButton } from './icon-button'

const copyText = async (text: string) => {
  if (typeof navigator.clipboard?.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // vx-bot/NOTE: Fall through to selection-based copy for restricted origins.
    }
  }

  const input = document.createElement('textarea')
  input.value = text
  input.setAttribute('readonly', '')
  input.style.position = 'fixed'
  input.style.top = '0'
  input.style.left = '-9999px'
  input.style.fontSize = '16px'
  document.body.appendChild(input)
  input.focus()
  input.select()
  input.setSelectionRange(0, text.length)
  const copied = document.execCommand('copy')
  input.remove()

  if (!copied) throw new Error('Clipboard copy is unavailable')
}

interface Props {
  message: Message
  isStreaming: boolean
  canRetry: boolean
  isAnimated: boolean
  onRetry: () => void
  onToggleTask: (messageId: string, index: number, done: boolean) => void
}

export const ChatMessage = ({
  message,
  isStreaming,
  canRetry,
  isAnimated,
  onRetry,
  onToggleTask
}: Props) => {
  const [copyStatus, setCopyStatus] = useState('')
  const copy = async () => {
    try {
      await copyText(
        [
          message.text,
          ...(message.tasks?.map(
            task => `${task.done ? '[x]' : '[ ]'} ${task.label}`
          ) ?? [])
        ].join('\n')
      )
      setCopyStatus('Copied')
    } catch {
      setCopyStatus('Copy unavailable. Select the text to copy it.')
    }
  }

  if (message.role === 'user')
    return (
      <article
        className="tamizhi-message tamizhi-message--user"
        aria-label="Your message">
        <p>{message.text}</p>
      </article>
    )

  return (
    <article
      className="tamizhi-message tamizhi-message--assistant"
      aria-label="Tamizhi’s response">
      <div className="tamizhi-message__identity">
        <Companion
          size="small"
          persona={message.persona}
          outfit={message.outfit}
          isAnimated={false}
        />
        <span>Tamizhi</span>
        <span className="tamizhi-message__demo">Demo response</span>
      </div>
      <div className="tamizhi-message__body" aria-busy={isStreaming}>
        {message.text ? (
          <Markdown
            components={{
              a: ({ children, ...props }) => (
                <a {...props} target="_blank" rel="noreferrer">
                  {children}
                </a>
              )
            }}>
            {message.text}
          </Markdown>
        ) : (
          <span className="tamizhi-message__thinking">
            A little thought in progress<span aria-hidden="true">...</span>
          </span>
        )}
        {isStreaming && (
          <span
            className="tamizhi-message__cursor"
            data-animated={isAnimated}
            aria-hidden="true"
          />
        )}
      </div>
      {message.tasks && (
        <Card className="tamizhi-message__checklist" variant="secondary">
          <Card.Header>
            <Card.Title>A little plan for today</Card.Title>
            <Card.Description>
              {message.tasks.filter(task => task.done).length} of{' '}
              {message.tasks.length} small steps complete
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-3">
            {message.tasks.map((task, index) => (
              <Checkbox
                key={task.label}
                isSelected={task.done}
                onChange={done => onToggleTask(message.id, index, done)}>
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Label className={task.done ? 'text-muted line-through' : ''}>
                    {task.label}
                  </Label>
                </Checkbox.Content>
              </Checkbox>
            ))}
          </Card.Content>
        </Card>
      )}
      {!isStreaming && message.text && (
        <div className="tamizhi-message__actions">
          <IconButton
            label={copyStatus === 'Copied' ? 'Copied' : 'Copy response'}
            size="sm"
            onPress={copy}>
            {copyStatus === 'Copied' ? (
              <CheckRead size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
          </IconButton>
          {canRetry && (
            <IconButton label="Try response again" size="sm" onPress={onRetry}>
              <Refresh size={16} aria-hidden="true" />
            </IconButton>
          )}
          <span role="status">{copyStatus}</span>
        </div>
      )}
    </article>
  )
}
