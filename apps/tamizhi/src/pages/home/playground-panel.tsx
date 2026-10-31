import { useState } from 'react'
import type { ReactNode, RefObject } from 'react'

import { Maximize, Minimize } from '@vezham/icons-react'
import { Sheet } from '@vezham/react-pro-v3'
import { CloseButton, ScrollShadow, Surface } from '@vezham/react-v3'

import { IconButton } from './icon-button'

interface Props {
  children: ReactNode
  isOpen: boolean
  isCompact: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: RefObject<HTMLButtonElement | null>
}

export const PlaygroundPanel = ({
  children,
  isOpen,
  isCompact,
  onOpenChange,
  triggerRef
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isCompact)
    return (
      <Sheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onAnimationEnd={open => {
          if (!open) triggerRef.current?.focus()
        }}
        placement="bottom"
        isHandleOnly
        shouldAutoFocus>
        <Sheet.Backdrop
          variant="blur"
          className="bg-overlay/10 z-80 backdrop-blur-xs">
          <Sheet.Content
            className={`mx-auto w-full ${isExpanded ? 'h-dvh max-h-none max-w-none' : 'h-[75dvh] max-h-[75dvh] max-w-2xl'}`}>
            <Sheet.Dialog
              id="tamizhi-playground"
              className={`flex h-full max-h-none min-h-0 flex-col overflow-hidden ${isExpanded ? 'rounded-none pt-[env(safe-area-inset-top)]' : 'rounded-t-[1.75rem]'}`}>
              <Surface
                variant="transparent"
                className="flex h-full min-h-0 flex-col overflow-hidden">
                {!isExpanded && <Sheet.Handle />}
                <Sheet.Header className="flex shrink-0 flex-row items-center gap-2 px-4 py-3">
                  <Sheet.Heading className="text-foreground min-w-0 flex-1 truncate text-base font-semibold">
                    Playground
                  </Sheet.Heading>
                  <IconButton
                    size="sm"
                    label={`${isExpanded ? 'Collapse' : 'Expand'} Playground`}
                    onPress={() => setIsExpanded(value => !value)}>
                    {isExpanded ? (
                      <Minimize size={18} aria-hidden="true" />
                    ) : (
                      <Maximize size={18} aria-hidden="true" />
                    )}
                  </IconButton>
                  <Sheet.CloseTrigger
                    aria-label="Close Playground"
                    className="static shrink-0"
                  />
                </Sheet.Header>
                <Sheet.Body className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  {children}
                </Sheet.Body>
              </Surface>
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>
    )

  if (!isOpen) return null

  return (
    <aside
      id="tamizhi-playground"
      className="tamizhi__playground"
      aria-labelledby="tamizhi-playground-title">
      <Surface
        variant="transparent"
        className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="tamizhi__playground-header">
          <h2 id="tamizhi-playground-title">Playground</h2>
          <CloseButton
            aria-label="Close Playground"
            onPress={() => onOpenChange(false)}
          />
        </div>
        <ScrollShadow hideScrollBar className="min-h-0 flex-1 px-4 pt-2 pb-4">
          {children}
        </ScrollShadow>
      </Surface>
    </aside>
  )
}
