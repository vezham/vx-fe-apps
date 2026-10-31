import { Button, Switch } from '@vezham/react-v3'

import { COLOURS, EXPRESSIONS, OUTFITS, PALETTE_COLOURS } from './avatar-data'
import type { Expression, Outfit } from './avatar-data'
import { BrainSettings } from './brain-settings'
import { Companion } from './companion'

interface Props {
  outfit: Outfit
  expression: Expression
  palette?: string
  isAnimated: boolean
  isOffline: boolean
  isInstant: boolean
  apiKey: string
  lastOutfit?: Outfit
  onOutfitChange: (outfit: Outfit) => void
  onExpressionChange: (expression: Expression) => void
  onPaletteChange: (palette: string | undefined) => void
  onAnimatedChange: (animated: boolean) => void
  onOfflineChange: (offline: boolean) => void
  onInstantChange: (instant: boolean) => void
  onApiKeyChange: (value: string) => void
}

export const Playground = ({
  outfit,
  expression,
  palette,
  isAnimated,
  isOffline,
  isInstant,
  apiKey,
  lastOutfit,
  onOutfitChange,
  onExpressionChange,
  onPaletteChange,
  onAnimatedChange,
  onOfflineChange,
  onInstantChange,
  onApiKeyChange
}: Props) => (
  <div className="tamizhi-playground">
    <section>
      <h2>Outfit</h2>
      <div
        className="tamizhi-playground__pills"
        role="group"
        aria-label="Outfit">
        {OUTFITS.map(item => (
          <Button
            key={item.id}
            size="sm"
            variant="ghost"
            aria-pressed={outfit === item.id}
            onPress={() => onOutfitChange(item.id)}>
            <span
              className="tamizhi-playground__outfit-dot"
              style={{ background: PALETTE_COLOURS[item.palette] }}
              aria-hidden="true"
            />
            {item.label}
          </Button>
        ))}
      </div>
    </section>
    <section>
      <h2>Expression</h2>
      <div
        className="tamizhi-playground__pills tamizhi-playground__pills--expressions"
        role="group"
        aria-label="Expression">
        {EXPRESSIONS.map(item => (
          <Button
            key={item.id}
            size="sm"
            variant="ghost"
            aria-pressed={expression === item.id}
            onPress={() =>
              onExpressionChange(expression === item.id ? 'neutral' : item.id)
            }>
            {item.label}
          </Button>
        ))}
      </div>
    </section>
    <section>
      <div className="tamizhi-playground__section-heading">
        <h2>Colour</h2>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Use outfit default colour"
          onPress={() => onPaletteChange(undefined)}>
          Outfit default
        </Button>
      </div>
      <div
        className="tamizhi-playground__colours"
        role="group"
        aria-label="Avatar colour">
        {COLOURS.map(item => (
          <Button
            key={item.id}
            isIconOnly
            size="sm"
            aria-label={item.name}
            aria-pressed={
              (palette ?? OUTFITS.find(item => item.id === outfit)?.palette) ===
              item.id
            }
            className="tamizhi-playground__swatch"
            style={{ background: item.color }}
            onPress={() => onPaletteChange(item.id)}
          />
        ))}
      </div>
    </section>
    <section>
      <h2>Connection</h2>
      <div
        className="tamizhi-playground__segment"
        role="group"
        aria-label="Connection">
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={!isOffline}
          onPress={() => onOfflineChange(false)}>
          Online
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={isOffline}
          onPress={() => onOfflineChange(true)}>
          Offline
        </Button>
      </div>
    </section>
    <section>
      <h2>Replies</h2>
      <div
        className="tamizhi-playground__segment"
        role="group"
        aria-label="Replies">
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={!isInstant}
          onPress={() => onInstantChange(false)}>
          Stream
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={isInstant}
          onPress={() => onInstantChange(true)}>
          Instant
        </Button>
      </div>
    </section>
    <section>
      <Switch isSelected={isAnimated} onChange={onAnimatedChange}>
        <Switch.Content className="w-full justify-between">
          Animation
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Content>
      </Switch>
    </section>
    <BrainSettings
      apiKey={apiKey}
      lastOutfit={lastOutfit}
      onApiKeyChange={onApiKeyChange}
    />
    <section aria-labelledby="tamizhi-avatar-sizes-title">
      <h2 id="tamizhi-avatar-sizes-title">Avatar sizes</h2>
      <div className="tamizhi-playground__sizes">
        {([72, 44, 28] as const).map(pixels => (
          <figure key={pixels} aria-label={`${pixels}px avatar preview`}>
            <Companion
              size="small"
              previewSize={pixels}
              outfit={outfit}
              expression={expression}
              palette={palette}
              isOffline={isOffline}
              isAnimated={false}
            />
            <figcaption>{pixels}px</figcaption>
          </figure>
        ))}
      </div>
    </section>
    <p className="tamizhi-playground__credit">
      Avatar by{' '}
      <a
        href="https://github.com/mortspace/momo"
        target="_blank"
        rel="noreferrer">
        Momo
      </a>{' '}
      · MIT
    </p>
  </div>
)
