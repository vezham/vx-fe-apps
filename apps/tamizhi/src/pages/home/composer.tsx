import { useRef, useState } from 'react'

import { Button, Form, Label, TextArea, TextField } from '@vezham/react-v3'

interface Props {
  isStreaming: boolean
  isReady: boolean
  isOffline: boolean
  onSend: (prompt: string) => void
  onStop: () => void
}

export const Composer = ({
  isStreaming,
  isReady,
  isOffline,
  onSend,
  onStop
}: Props) => {
  const [text, setText] = useState('')
  const input = useRef<HTMLTextAreaElement>(null)
  const send = () => {
    if (!text.trim() || isStreaming || !isReady || isOffline) return
    onSend(text)
    setText('')
    if (input.current) input.current.style.height = ''
    input.current?.focus()
  }
  return (
    <div className="tamizhi-composer">
      <Form
        onSubmit={event => {
          event.preventDefault()
          send()
        }}
        className="tamizhi-composer__form">
        <TextField
          value={text}
          onChange={setText}
          isDisabled={isOffline}
          className="min-w-0 flex-1">
          <Label className="sr-only">Message Tamizhi</Label>
          <TextArea
            ref={input}
            placeholder={isOffline ? 'You’re offline' : 'Ask Tamizhi anything'}
            maxLength={4000}
            rows={1}
            className="tamizhi-composer__input"
            onInput={event => {
              event.currentTarget.style.height = 'auto'
              event.currentTarget.style.height = `${Math.min(208, event.currentTarget.scrollHeight)}px`
            }}
            onKeyDown={event => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                send()
              }
            }}
          />
        </TextField>
        {isStreaming ? (
          <Button
            aria-label="Stop response"
            variant="secondary"
            className="tamizhi-composer__send"
            onPress={onStop}>
            Stop
          </Button>
        ) : (
          <Button
            aria-label="Send message"
            type="submit"
            className="tamizhi-composer__send"
            isDisabled={!text.trim() || !isReady || isOffline}>
            Send
          </Button>
        )}
      </Form>
      <p className="tamizhi-composer__note">
        Local demo · Replies are written ahead of time
      </p>
    </div>
  )
}
