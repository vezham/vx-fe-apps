import { AltArrowDown } from '@vezham/icons-react'
import { Button, Dropdown, Switch, Tabs } from '@vezham/react-v3'

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
      <Dropdown>
        <Dropdown.Trigger
          className="tamizhi-playground__select"
          aria-label="Choose outfit">
          <span
            className="tamizhi-playground__outfit-dot"
            style={{
              background:
                PALETTE_COLOURS[
                  OUTFITS.find(item => item.id === outfit)?.palette ??
                    'persimmon'
                ]
            }}
            aria-hidden="true"
          />
          {OUTFITS.find(item => item.id === outfit)?.label}
          <AltArrowDown size={16} aria-hidden="true" />
        </Dropdown.Trigger>
        <Dropdown.Popover className="tamizhi-playground__menu">
          <Dropdown.Menu
            aria-label="Outfit"
            selectionMode="single"
            selectedKeys={[outfit]}>
            {OUTFITS.map(item => (
              <Dropdown.Item
                key={item.id}
                id={item.id}
                textValue={item.label}
                onAction={() => onOutfitChange(item.id)}>
                <span
                  className="tamizhi-playground__outfit-dot"
                  style={{ background: PALETTE_COLOURS[item.palette] }}
                  aria-hidden="true"
                />
                {item.label}
                <Dropdown.ItemIndicator />
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </section>
    <section>
      <h2>Expression</h2>
      <Dropdown>
        <Dropdown.Trigger
          className="tamizhi-playground__select"
          aria-label="Choose expression">
          {EXPRESSIONS.find(item => item.id === expression)?.label}
          <AltArrowDown size={16} aria-hidden="true" />
        </Dropdown.Trigger>
        <Dropdown.Popover className="tamizhi-playground__menu">
          <Dropdown.Menu
            aria-label="Expression"
            selectionMode="single"
            selectedKeys={[expression]}>
            {EXPRESSIONS.map(item => (
              <Dropdown.Item
                key={item.id}
                id={item.id}
                textValue={item.label}
                onAction={() => onExpressionChange(item.id)}>
                {item.label}
                <Dropdown.ItemIndicator />
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </section>
    <section>
      <h2>Colour</h2>
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
      <Tabs
        selectedKey={isOffline ? 'offline' : 'online'}
        onSelectionChange={key => onOfflineChange(key === 'offline')}>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Connection">
            <Tabs.Tab id="online">
              Online
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="offline">
              Offline
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
    </section>
    <section>
      <h2>Replies</h2>
      <Tabs
        selectedKey={isInstant ? 'instant' : 'stream'}
        onSelectionChange={key => onInstantChange(key === 'instant')}>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Replies">
            <Tabs.Tab id="stream">
              Stream
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="instant">
              Instant
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
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
