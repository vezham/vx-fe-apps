import { Outlet, useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { useMediaQuery } from '@vezham/react-v3'
import { SectionLayout } from '@vezham/react/layouts/section'
import type { SectionAction } from '@vezham/react/layouts/section'

import { OUTFITS, detectOutfit } from './avatar-data'
import type { Expression, Outfit } from './avatar-data'
import { BotPicker } from './bot-picker'
import { ChatMessage } from './chat-message'
import { Companion } from './companion'
import { Composer } from './composer'
import { EXAMPLES } from './demo'
import { Playground } from './playground'
import { PlaygroundPanel } from './playground-panel'
import { getSidebarItems } from './sidebar'
import { useAvatarPlacement } from './use-avatar-placement'
import { useDemoChat } from './use-demo-chat'

export default () => {
  const [isInstant, setIsInstant] = useState(false)
  const chat = useDemoChat(isInstant)
  const {
    activeId,
    conversations,
    isReady,
    newChat,
    selectChat,
    send: sendChat
  } = chat
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { chatId?: string }
  const routeItemId = params.chatId
  const routeExampleId = routeItemId?.startsWith('example-')
    ? routeItemId.slice('example-'.length)
    : undefined
  const routeChatId =
    routeItemId && routeItemId !== 'new' && !routeExampleId
      ? routeItemId
      : undefined
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false)
  const isCompact = useMediaQuery('(width < 64rem)', {
    initializeWithValue: false
  })
  const [isAnimated, setIsAnimated] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [manualOutfit, setManualOutfit] = useState<Outfit | null>(null)
  const [botName, setBotName] = useState('Tamizhi')
  const [expression, setExpression] = useState<Expression>('neutral')
  const [palette, setPalette] = useState<string | undefined>()
  const [apiKey, setApiKey] = useState('')
  const composerInput = useRef<HTMLTextAreaElement>(null)
  const scroll = useRef<HTMLDivElement>(null)
  const shouldFollow = useRef(true)
  const hasMessages = chat.messages.length > 0
  const { main, welcomeAvatarSlot, chatAvatarSlot, avatarLayer } =
    useAvatarPlacement(hasMessages, isAnimated)
  const [isListening, setIsListening] = useState(false)
  const handledExample = useRef<string | null>(null)
  const exampleStartedFrom = useRef<string | null>(null)
  const lastRouteItem = useRef<string | undefined>(undefined)
  const isFreshNewRoute = useRef(true)
  const lastUser = [...chat.messages]
    .reverse()
    .find(message => message.role === 'user')
  const outfit =
    manualOutfit ?? (lastUser ? detectOutfit(lastUser.text) : 'rest')
  const outfitInfo = OUTFITS.find(item => item.id === outfit) ?? OUTFITS[0]

  useEffect(() => {
    if (!isReady) return

    if (routeExampleId) {
      lastRouteItem.current = routeItemId
      if (handledExample.current === routeExampleId) return
      handledExample.current = routeExampleId
      exampleStartedFrom.current = activeId
      const example = EXAMPLES.find(item => item.id === routeExampleId)
      if (!example || isOffline) {
        navigate({
          to: '/chat/$chatId',
          params: { chatId: 'new' },
          replace: true
        })
        return
      }

      shouldFollow.current = true
      setManualOutfit(null)
      setPalette(undefined)
      setExpression('neutral')
      setIsListening(false)
      sendChat(example.prompt, example.persona, true, example.title)
      return
    }

    handledExample.current = null
    exampleStartedFrom.current = null

    if (!routeItemId) {
      navigate({
        to: '/chat/$chatId',
        params: { chatId: 'new' },
        replace: true
      })
      return
    }

    if (routeItemId === 'new') {
      if (lastRouteItem.current !== 'new') {
        isFreshNewRoute.current = true
        if (activeId) newChat()
      }
      lastRouteItem.current = routeItemId
      return
    }

    isFreshNewRoute.current = false
    lastRouteItem.current = routeItemId

    if (!conversations.some(conversation => conversation.id === routeChatId)) {
      navigate({
        to: '/chat/$chatId',
        params: { chatId: 'new' },
        replace: true
      })
      return
    }

    if (routeChatId && activeId !== routeChatId) {
      shouldFollow.current = true
      setManualOutfit(null)
      setPalette(undefined)
      setExpression('neutral')
      setIsListening(false)
      selectChat(routeChatId)
    }
  }, [
    activeId,
    conversations,
    isReady,
    newChat,
    selectChat,
    sendChat,
    isOffline,
    navigate,
    routeChatId,
    routeExampleId,
    routeItemId
  ])

  useEffect(() => {
    if (!isReady || !activeId) return

    if (
      (routeItemId === 'new' && !isFreshNewRoute.current) ||
      (routeExampleId &&
        handledExample.current === routeExampleId &&
        activeId !== exampleStartedFrom.current)
    )
      navigate({
        to: '/chat/$chatId',
        params: { chatId: activeId },
        replace: true
      })
  }, [activeId, isReady, navigate, routeExampleId, routeItemId])

  useEffect(() => {
    if (scroll.current && shouldFollow.current)
      scroll.current.scrollTop = scroll.current.scrollHeight
  }, [chat.messages])

  const send = (prompt: string) => {
    if (isOffline) return
    if (routeItemId === 'new') isFreshNewRoute.current = false
    shouldFollow.current = true
    setManualOutfit(null)
    setExpression('neutral')
    setPalette(undefined)
    chat.send(prompt)
  }
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
            onAction: () => {
              if (!chat.activeId) return
              chat.deleteChat(chat.activeId)
              navigate({
                to: '/chat/$chatId',
                params: { chatId: 'new' }
              })
            }
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
            <h1 className="mb-2 shrink-0 truncate text-base font-semibold md:hidden">
              {chat.active?.title}
            </h1>
          )}
          <div
            className="tamizhi__scroll"
            ref={scroll}
            onScroll={() => {
              const element = scroll.current
              if (element)
                shouldFollow.current =
                  element.scrollHeight -
                    element.scrollTop -
                    element.clientHeight <
                  100
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
              <section
                className="tamizhi-conversation"
                aria-label="Conversation">
                {chat.messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isStreaming={
                      chat.isStreaming && index === chat.messages.length - 1
                    }
                    isAnimated={isAnimated}
                    canRetry={
                      !isOffline &&
                      !chat.isStreaming &&
                      index === chat.messages.length - 1
                    }
                    onRetry={() => {
                      shouldFollow.current = true
                      chat.retry()
                    }}
                    onToggleTask={chat.toggleTask}
                  />
                ))}
              </section>
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
            onSend={send}
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
