import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

import { Button, Form, Label, TextArea, TextField } from '@vezham/react-v3'

interface Props {
  isStreaming: boolean
  isReady: boolean
  isOffline: boolean
  avatarSlotRef: RefObject<HTMLDivElement | null>
  inputRef: RefObject<HTMLTextAreaElement | null>
  onListeningChange: (isListening: boolean) => void
  onSend: (prompt: string) => void
  onStop: () => void
}

export const Composer = ({
  isStreaming,
  isReady,
  isOffline,
  avatarSlotRef,
  inputRef,
  onListeningChange,
  onSend,
  onStop
}: Props) => {
  const [text, setText] = useState('')
  const listeningTimer = useRef<number | undefined>(undefined)
  const signalListening = (duration = 1100) => {
    onListeningChange(true)
    if (listeningTimer.current !== undefined)
      window.clearTimeout(listeningTimer.current)
    listeningTimer.current = window.setTimeout(() => {
      listeningTimer.current = undefined
      onListeningChange(false)
    }, duration)
  }
  const stopListening = () => {
    if (listeningTimer.current !== undefined)
      window.clearTimeout(listeningTimer.current)
    listeningTimer.current = undefined
    onListeningChange(false)
  }
  useEffect(
    () => () => {
      if (listeningTimer.current !== undefined)
        window.clearTimeout(listeningTimer.current)
    },
    []
  )
  const send = () => {
    if (!text.trim() || isStreaming || !isReady || isOffline) return
    stopListening()
    onSend(text)
    setText('')
    if (inputRef.current) inputRef.current.style.height = ''
    inputRef.current?.focus()
  }
  return (
    <div className="tamizhi-composer">
      <Form
        onSubmit={event => {
          event.preventDefault()
          send()
        }}
        className="tamizhi-composer__form">
        <div
          className="tamizhi__perch"
          ref={avatarSlotRef}
          aria-hidden="true"
        />
        <TextField
          value={text}
          onChange={value => {
            setText(value)
            signalListening()
          }}
          isDisabled={isOffline}
          className="min-w-0 flex-1">
          <Label className="sr-only">Message Tamizhi</Label>
          <TextArea
            ref={inputRef}
            placeholder={isOffline ? 'You’re offline' : 'Ask Tamizhi anything'}
            maxLength={4000}
            rows={1}
            className="tamizhi-composer__input"
            onFocus={() => signalListening(800)}
            onBlur={stopListening}
            onInput={event => {
              signalListening()
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
