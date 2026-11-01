import { useLayoutEffect, useRef } from 'react'

interface Position {
  x: number
  y: number
  width: number
}

export const useAvatarPlacement = (isChat: boolean, isAnimated: boolean) => {
  const main = useRef<HTMLElement>(null)
  const welcomeAvatarSlot = useRef<HTMLDivElement>(null)
  const chatAvatarSlot = useRef<HTMLDivElement>(null)
  const avatarLayer = useRef<HTMLDivElement>(null)
  const position = useRef<Position | null>(null)

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let last = performance.now()

    const update = (now: number) => {
      const container = main.current
      const layer = avatarLayer.current
      const slot = isChat ? chatAvatarSlot.current : welcomeAvatarSlot.current
      const elapsed = Math.min(0.05, Math.max(0, (now - last) / 1000))
      last = now

      if (container && layer && slot) {
        const bounds = container.getBoundingClientRect()
        const target = slot.getBoundingClientRect()
        const baseWidth = layer.offsetWidth

        if (target.width > 0 && baseWidth > 0) {
          const current = (position.current ??= {
            x: target.left,
            y: target.top,
            width: target.width
          })
          const blend =
            !isAnimated || reducedMotion.matches
              ? 1
              : 1 - Math.exp(-elapsed * 9)
          const destination = {
            x: target.left,
            y: target.top,
            width: target.width
          }

          for (const axis of ['x', 'y', 'width'] as const) {
            const delta = destination[axis] - current[axis]
            current[axis] += Math.abs(delta) < 0.01 ? delta : delta * blend
          }

          // vx-bot/NOTE: Track motion in viewport coordinates so shell movement does not add a jump.
          const transform = `translate3d(${current.x - bounds.left}px, ${current.y - bounds.top}px, 0) scale(${current.width / baseWidth})`
          if (layer.style.transform !== transform)
            layer.style.transform = transform
          layer.style.visibility = 'visible'
        }
      }

      frame = window.requestAnimationFrame(update)
    }

    const resume = () => {
      window.cancelAnimationFrame(frame)
      last = performance.now()
      if (document.visibilityState !== 'hidden') update(last)
    }

    resume()
    document.addEventListener('visibilitychange', resume)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', resume)
    }
  }, [isChat, isAnimated])

  return { main, welcomeAvatarSlot, chatAvatarSlot, avatarLayer }
}
