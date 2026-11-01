import { useEffect, useRef, useState } from 'react'

import { HamburgerMenu, Tuning } from '@vezham/icons-react'
import { Button, Drawer, useMediaQuery } from '@vezham/react-v3'

import { OUTFITS, detectOutfit } from './avatar-data'
import type { Expression, Outfit } from './avatar-data'
import { BotPicker } from './bot-picker'
import { ChatMessage } from './chat-message'
import { Companion } from './companion'
import { Composer } from './composer'
import { IconButton } from './icon-button'
import { Playground } from './playground'
import { PlaygroundPanel } from './playground-panel'
import { Sidebar } from './sidebar'
import { useDemoChat } from './use-demo-chat'

export default () => {
  const [isInstant, setIsInstant] = useState(false)
  const chat = useDemoChat(isInstant)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
  const playgroundTrigger = useRef<HTMLButtonElement>(null)
  const scroll = useRef<HTMLDivElement>(null)
  const shouldFollow = useRef(true)
  const lastUser = [...chat.messages]
    .reverse()
    .find(message => message.role === 'user')
  const outfit =
    manualOutfit ?? (lastUser ? detectOutfit(lastUser.text) : 'rest')
  const outfitInfo = OUTFITS.find(item => item.id === outfit) ?? OUTFITS[0]

  useEffect(() => {
    if (scroll.current && shouldFollow.current)
      scroll.current.scrollTop = scroll.current.scrollHeight
  }, [chat.messages])

  const newChat = () => {
    chat.newChat()
    setIsMenuOpen(false)
    setManualOutfit(null)
    setBotName('Tamizhi')
    setExpression('neutral')
    setPalette(undefined)
    shouldFollow.current = true
  }
  const send = (prompt: string) => {
    if (isOffline) return
    shouldFollow.current = true
    setManualOutfit(null)
    setExpression('neutral')
    setPalette(undefined)
    chat.send(prompt)
    setIsMenuOpen(false)
  }
  const sidebar = (
    <Sidebar
      conversations={chat.conversations}
      activeId={chat.activeId}
      isSaved={chat.isSaved}
      onNewChat={newChat}
      onSelectChat={id => {
        shouldFollow.current = true
        setManualOutfit(null)
        setPalette(undefined)
        setExpression('neutral')
        chat.selectChat(id)
        setIsMenuOpen(false)
      }}
      onDeleteChat={chat.deleteChat}
      onExample={example => {
        if (isOffline) return
        shouldFollow.current = true
        setIsMenuOpen(false)
        setManualOutfit(null)
        setPalette(undefined)
        setExpression('neutral')
        chat.send(example.prompt, example.persona, true, example.title)
      }}
    />
  )
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
      <aside className="tamizhi__sidebar" aria-label="Conversations">
        {sidebar}
      </aside>
      <section className="tamizhi__main" aria-label="Tamizhi chat">
        <header className="tamizhi__header">
          <div className="flex min-w-0 items-center gap-2">
            <IconButton
              label="Open conversations"
              className="tamizhi__menu-toggle"
              aria-expanded={isMenuOpen}
              aria-controls={
                isMenuOpen ? 'tamizhi-conversation-drawer' : undefined
              }
              aria-haspopup="dialog"
              onPress={() => setIsMenuOpen(true)}>
              <HamburgerMenu size={20} aria-hidden="true" />
            </IconButton>
            <span className="tamizhi__header-title">
              {chat.active?.title ?? 'New chat'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="tamizhi__connection"
              data-offline={isOffline}
              role="status">
              <span aria-hidden="true" />
              {isOffline ? 'Offline' : 'Local demo'}
            </span>
            <Button
              ref={playgroundTrigger}
              variant="secondary"
              className="tamizhi__playground-button"
              aria-label="Playground"
              aria-expanded={isPlaygroundOpen}
              aria-controls={
                isPlaygroundOpen ? 'tamizhi-playground' : undefined
              }
              aria-haspopup={isCompact ? 'dialog' : undefined}
              onPress={() => setIsPlaygroundOpen(value => !value)}>
              <Tuning size={16} aria-hidden="true" />
              Playground
            </Button>
          </div>
        </header>
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
          {chat.messages.length === 0 ? (
            <section
              className="tamizhi-welcome"
              aria-labelledby="welcome-title">
              <div className="tamizhi-welcome__stage">
                <Companion
                  outfit={outfit}
                  expression={expression}
                  palette={palette}
                  isAnimated={isAnimated}
                  isOffline={isOffline}
                />
              </div>
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
            <section className="tamizhi-conversation" aria-label="Conversation">
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
        {chat.messages.length > 0 && (
          <div className="tamizhi__perch">
            <Companion
              outfit={outfit}
              expression={expression}
              palette={palette}
              isThinking={chat.isStreaming}
              isAnimated={isAnimated}
              isOffline={isOffline}
            />
            <span className="sr-only" role="status">
              {outfitInfo.name} mode
            </span>
          </div>
        )}
        <Composer
          isStreaming={chat.isStreaming}
          isReady={chat.isReady}
          isOffline={isOffline}
          onSend={send}
          onStop={chat.stop}
        />
      </section>
      <PlaygroundPanel
        triggerRef={playgroundTrigger}
        isOpen={isPlaygroundOpen}
        isCompact={isCompact}
        onOpenChange={open => {
          setIsPlaygroundOpen(open)
          if (!open && !isCompact) playgroundTrigger.current?.focus()
        }}>
        {playground}
      </PlaygroundPanel>
      <Drawer.Backdrop
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        className="tamizhi-overlay">
        <Drawer.Content placement="left">
          <Drawer.Dialog
            id="tamizhi-conversation-drawer"
            className="tamizhi__mobile-sidebar"
            aria-label="Conversations">
            <Drawer.CloseTrigger />
            {sidebar}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
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
