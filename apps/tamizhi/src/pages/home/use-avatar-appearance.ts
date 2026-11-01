import { useState } from 'react'

import type { Expression, Outfit } from './avatar-data'

interface Appearance {
  manualOutfit: Outfit | null
  expression: Expression
  palette?: string
  isListening: boolean
}

const DEFAULT_APPEARANCE: Appearance = {
  manualOutfit: null,
  expression: 'neutral',
  palette: undefined,
  isListening: false
}

export const useAvatarAppearance = (chatId: string | null) => {
  const [state, setState] = useState({ chatId, ...DEFAULT_APPEARANCE })
  const appearance = state.chatId === chatId ? state : DEFAULT_APPEARANCE
  const update = (change: Partial<Appearance>) =>
    setState(current => ({
      ...(current.chatId === chatId ? current : DEFAULT_APPEARANCE),
      ...change,
      chatId
    }))

  return {
    ...appearance,
    setManualOutfit: (manualOutfit: Outfit | null) => update({ manualOutfit }),
    setExpression: (expression: Expression) => update({ expression }),
    setPalette: (palette?: string) => update({ palette }),
    setIsListening: (isListening: boolean) => update({ isListening }),
    reset: () => update(DEFAULT_APPEARANCE)
  }
}
