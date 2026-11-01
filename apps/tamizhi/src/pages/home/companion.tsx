import { outfitForPersona } from './avatar-data'
import type { Expression, Outfit } from './avatar-data'
import type { Persona } from './demo'
import { useCompanionRenderer } from './use-companion-renderer'

interface Props {
  persona?: Persona
  outfit?: Outfit
  expression?: Expression
  palette?: string
  isListening?: boolean
  isThinking?: boolean
  isAnimated?: boolean
  isOffline?: boolean
  focusTarget?: HTMLElement | null
  size?: 'small' | 'large'
  previewSize?: 28 | 44 | 72
}

export const Companion = ({
  persona = 'helper',
  outfit = outfitForPersona(persona),
  expression = 'neutral',
  palette,
  isListening = false,
  isThinking = false,
  isAnimated = true,
  isOffline = false,
  focusTarget = null,
  size = 'large',
  previewSize
}: Props) => {
  const { host, connectionReaction, status } = useCompanionRenderer({
    outfit,
    expression,
    palette,
    isListening,
    isThinking,
    isAnimated,
    isOffline,
    focusTarget,
    size,
    previewSize
  })

  return (
    <div
      ref={host}
      className={`tamizhi-companion tamizhi-companion--${size}`}
      data-connection-reaction={connectionReaction?.phase}
      style={
        previewSize
          ? {
              width: `${previewSize / 16}rem`,
              height: `${previewSize / 16}rem`
            }
          : undefined
      }
      data-outfit={outfit}
      data-expression={expression}
      data-animated={isAnimated}
      data-status={status}
      aria-label={status === 'error' ? 'Avatar unavailable' : undefined}>
      {status === 'error' && (
        <span className="tamizhi-companion__error">Avatar unavailable</span>
      )}
    </div>
  )
}
