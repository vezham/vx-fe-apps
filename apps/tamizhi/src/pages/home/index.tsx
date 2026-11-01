import { Outlet } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { useMediaQuery } from '@vezham/react-v3'
import { SectionLayout } from '@vezham/react/layouts/section'
import type { SectionAction } from '@vezham/react/layouts/section'

import { OUTFITS, detectOutfit } from './avatar-data'
import { BotPicker } from './bot-picker'
import { Companion } from './companion'
import { Composer } from './composer'
import { Conversation } from './conversation'
import { Playground } from './playground'
import { PlaygroundPanel } from './playground-panel'
import { getSidebarItems } from './sidebar'
import { useAvatarAppearance } from './use-avatar-appearance'
import { useAvatarPlacement } from './use-avatar-placement'
import { useChatNavigation } from './use-chat-navigation'

export default () => {
  const [isInstant, setIsInstant] = useState(false)
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false)
  const isCompact = useMediaQuery('(width < 64rem)', {
    initializeWithValue: false
  })
  const [isAnimated, setIsAnimated] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [botName, setBotName] = useState('Tamizhi')
  const [apiKey, setApiKey] = useState('')
  const composerInput = useRef<HTMLTextAreaElement>(null)
  const scroll = useRef<HTMLDivElement>(null)
  const shouldFollow = useRef({ chatId: null as string | null, enabled: true })
  const chat = useChatNavigation({ isInstant, isOffline })
  const {
    manualOutfit,
    expression,
    palette,
    isListening,
    setManualOutfit,
    setExpression,
    setPalette,
    setIsListening,
    reset: resetAppearance
  } = useAvatarAppearance(chat.activeId)
  const hasMessages = chat.messages.length > 0
  const { main, welcomeAvatarSlot, chatAvatarSlot, avatarLayer } =
    useAvatarPlacement(hasMessages, isAnimated)
  const lastUser = [...chat.messages]
    .reverse()
    .find(message => message.role === 'user')
  const outfit =
    manualOutfit ?? (lastUser ? detectOutfit(lastUser.text) : 'rest')
  const outfitInfo = OUTFITS.find(item => item.id === outfit) ?? OUTFITS[0]

  useEffect(() => {
    if (
      scroll.current &&
      (shouldFollow.current.chatId !== chat.activeId ||
        shouldFollow.current.enabled)
    )
      scroll.current.scrollTop = scroll.current.scrollHeight
  }, [chat.messages, chat.activeId])

  const menuActions: SectionAction[] = [
    {
      key: 'playground',
      label: 'Playground',
      icon: 'vx:tuning',
      onAction: () => setIsPlaygroundOpen(true)
    },
    ...(chat.activeId
      ? [
          {
            key: 'delete-chat',
            label: 'Delete chat',
            icon: 'vx:trash',
            onAction: chat.deleteActiveChat
          }
        ]
      : [])
  ]
  const playground = (
    <Playground
      outfit={outfit}
      expression={expression}
      palette={palette}
      isAnimated={isAnimated}
      isOffline={isOffline}
      isInstant={isInstant}
      apiKey={apiKey}
      lastOutfit={lastUser ? detectOutfit(lastUser.text) : undefined}
      onOutfitChange={value => {
        setManualOutfit(value)
        setPalette(undefined)
      }}
      onExpressionChange={setExpression}
      onPaletteChange={setPalette}
      onAnimatedChange={setIsAnimated}
      onOfflineChange={value => {
        if (value === isOffline) return
        if (value) chat.stop()
        setIsOffline(value)
      }}
      onInstantChange={setIsInstant}
      onApiKeyChange={setApiKey}
    />
  )

  return (
    <div className="tamizhi">
      <SectionLayout
        sectionKey="tamizhi"
        title="Tamizhi"
        navigationLabel="Tamizhi conversations"
        sidebarItems={getSidebarItems(chat.conversations)}
        tabs={[]}
        sync={false}
        filter={false}
        sort={false}
        toolbar={
          hasMessages ? (
            <h1 className="min-w-0 flex-1 truncate text-base font-semibold">
              {chat.active?.title}
            </h1>
          ) : undefined
        }
        menuActions={menuActions}>
        <section ref={main} className="tamizhi__main" aria-label="Tamizhi chat">
          {hasMessages && (
            <header className="tamizhi__compact-header">
              <h1 className="min-w-0 truncate text-center text-base font-semibold">
                {chat.active?.title}
              </h1>
            </header>
          )}
          <div
            className="tamizhi__scroll"
            ref={scroll}
            onScroll={() => {
              const element = scroll.current
              if (element)
                shouldFollow.current = {
                  chatId: chat.activeId,
                  enabled:
                    element.scrollHeight -
                      element.scrollTop -
                      element.clientHeight <
                    100
                }
            }}>
            {!hasMessages ? (
              <section
                className="tamizhi-welcome"
                aria-labelledby="welcome-title">
                <div
                  className="tamizhi-welcome__stage"
                  ref={welcomeAvatarSlot}
                />
                <BotPicker
                  name={botName}
                  outfit={outfit}
                  onSelect={(name, value) => {
                    setBotName(name)
                    setManualOutfit(value)
                    setPalette(undefined)
                    setExpression('neutral')
                  }}
                />
              </section>
            ) : (
              <Conversation
                messages={chat.messages}
                isStreaming={chat.isStreaming}
                isAnimated={isAnimated}
                isOffline={isOffline}
                onRetry={() => {
                  shouldFollow.current.enabled = true
                  chat.retry()
                }}
                onToggleTask={chat.toggleTask}
              />
            )}
          </div>
          <div
            ref={avatarLayer}
            className="tamizhi__companion-layer"
            aria-hidden="true">
            <Companion
              outfit={outfit}
              expression={expression}
              palette={palette}
              isListening={isListening}
              isThinking={chat.isStreaming}
              isAnimated={isAnimated}
              isOffline={isOffline}
              focusTarget={composerInput.current}
            />
          </div>
          {hasMessages && (
            <span className="sr-only" role="status">
              {outfitInfo.name} mode
            </span>
          )}
          <Composer
            isStreaming={chat.isStreaming}
            isReady={chat.isReady}
            isOffline={isOffline}
            avatarSlotRef={chatAvatarSlot}
            inputRef={composerInput}
            onListeningChange={setIsListening}
            onSend={prompt => {
              shouldFollow.current.enabled = true
              resetAppearance()
              chat.send(prompt)
            }}
            onStop={chat.stop}
          />
        </section>
        <Outlet />
      </SectionLayout>
      <PlaygroundPanel
        isOpen={isPlaygroundOpen}
        isCompact={isCompact}
        onOpenChange={setIsPlaygroundOpen}>
        {playground}
      </PlaygroundPanel>
      <span className="sr-only" role="status">
        {chat.isStreaming
          ? 'Tamizhi is responding.'
          : chat.messages.length
            ? 'Response complete.'
            : 'Ready for a conversation.'}
      </span>
    </div>
  )
}
