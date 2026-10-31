import { useState } from 'react'

import { Button, Form, Input, Label, TextField } from '@vezham/react-v3'

import { OUTFITS } from './avatar-data'
import type { Outfit } from './avatar-data'

interface Props {
  apiKey: string
  lastOutfit?: Outfit
  onApiKeyChange: (value: string) => void
}

export const BrainSettings = ({
  apiKey,
  lastOutfit,
  onApiKeyChange
}: Props) => {
  const [draftKey, setDraftKey] = useState('')
  const lastPick = OUTFITS.find(item => item.id === lastOutfit)

  return (
    <section aria-labelledby="tamizhi-brain-title">
      <h2 id="tamizhi-brain-title">Brain</h2>
      <p className="mb-3">Setup preview · No provider connected</p>
      {apiKey ? (
        <div className="flex items-center justify-between gap-2">
          <code aria-label="Saved API key">•••• {apiKey.slice(-4)}</code>
          <Button
            size="sm"
            variant="secondary"
            aria-label="Remove API key"
            onPress={() => onApiKeyChange('')}>
            Remove
          </Button>
        </div>
      ) : (
        <Form
          className="flex flex-row items-end gap-2"
          autoComplete="off"
          onSubmit={event => {
            event.preventDefault()
            if (!draftKey.trim()) return
            onApiKeyChange(draftKey.trim())
            setDraftKey('')
          }}>
          <TextField
            value={draftKey}
            onChange={setDraftKey}
            className="min-w-0 flex-1">
            <Label className="sr-only">Provider API key</Label>
            <Input
              type="password"
              placeholder="Provider API key"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={200}
            />
          </TextField>
          <Button
            type="submit"
            variant="secondary"
            aria-label="Save API key"
            isDisabled={!draftKey.trim()}>
            Save
          </Button>
        </Form>
      )}
      <p className="mt-2" role="status">
        {apiKey
          ? 'Key held for this session. Using local rules.'
          : 'Using local rules'}
      </p>
      <p>Replies are written ahead of time</p>
      {lastPick && (
        <div className="tamizhi-playground__last-pick" aria-label="Last pick">
          <p>Last pick: {lastPick.label}</p>
          <p>Source: local rules</p>
          <p>Reply: prepared demo response</p>
        </div>
      )}
    </section>
  )
}
