import { useEffect, useRef, useState } from 'react'

import { outfitForPersona } from './avatar-data'
import type { Expression, Outfit } from './avatar-data'
import {
  avatarState,
  createAvatarRenderer,
  getSnapshotRenderer
} from './avatar-renderer'
import type { AvatarRenderer } from './avatar-renderer'
import type { Persona } from './demo'

interface Props {
  persona?: Persona
  outfit?: Outfit
  expression?: Expression
  palette?: string
  isThinking?: boolean
  isAnimated?: boolean
  isOffline?: boolean
  size?: 'small' | 'large'
  previewSize?: 28 | 44 | 72
}

export const Companion = ({
  persona = 'helper',
  outfit = outfitForPersona(persona),
  expression = 'neutral',
  palette,
  isThinking = false,
  isAnimated = true,
  isOffline = false,
  size = 'large',
  previewSize
}: Props) => {
  const host = useRef<HTMLDivElement>(null)
  const redraw = useRef<(() => void) | undefined>(undefined)
  const latest = useRef({
    outfit,
    expression,
    palette,
    isThinking,
    isOffline,
    isAnimated
  })
  const [status, setStatus] = useState('loading')
  useEffect(() => {
    latest.current = {
      outfit,
      expression,
      palette,
      isThinking,
      isOffline,
      isAnimated
    }
    redraw.current?.()
  }, [outfit, expression, palette, isThinking, isOffline, isAnimated])

  useEffect(() => {
    const element = host.current
    if (!element || import.meta.env.MODE === 'test') return
    let cancelled = false
    let frame = 0
    let renderer: AvatarRenderer | undefined
    let canvas: HTMLCanvasElement | undefined
    let appearanceObserver: MutationObserver | undefined
    let visible = true
    let lastInteraction = performance.now()
    const pointer = [0, 0]
    const start = performance.now()
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting
      if (visible) redraw.current?.()
    })
    observer.observe(element)
    const followPointer = (event: PointerEvent) => {
      lastInteraction = performance.now()
      const bounds = element.getBoundingClientRect()
      pointer[0] = Math.max(
        -0.09,
        Math.min(0.09, (event.clientX - bounds.x - bounds.width / 2) / 5000)
      )
      pointer[1] = Math.max(
        -0.04,
        Math.min(0.04, -(event.clientY - bounds.y - bounds.height / 2) / 5000)
      )
    }
    if (size === 'large')
      window.addEventListener('pointermove', followPointer, { passive: true })
    const resumeSnapshot = () => {
      if (document.visibilityState === 'visible') redraw.current?.()
    }
    if (size === 'small')
      document.addEventListener('visibilitychange', resumeSnapshot)

    const run = async () => {
      try {
        renderer = await (size === 'small'
          ? getSnapshotRenderer()
          : createAvatarRenderer())
        if (cancelled) {
          if (size === 'large')
            renderer.gl?.getExtension('WEBGL_lose_context')?.loseContext()
          return
        }
        canvas =
          size === 'small' ? document.createElement('canvas') : renderer.canvas
        canvas.width = canvas.height = size === 'small' ? 72 : 340
        canvas.setAttribute('aria-hidden', 'true')
        element.appendChild(canvas)
        let lastDraw = 0
        let previous = ''
        let shownOutfit = latest.current.outfit
        let spinStarted = -1
        let previousPalette: number[][] | undefined
        let snapshotIdle = false
        const draw = async (now: number) => {
          if (cancelled || !renderer || !canvas) return
          try {
            const settings = {
              ...latest.current,
              isDark: document.documentElement.classList.contains('dark')
            }
            const key = JSON.stringify(settings)
            const animated =
              size === 'large' && settings.isAnimated && !reduced.matches
            if (
              size === 'small' &&
              (!visible || document.visibilityState !== 'visible')
            ) {
              snapshotIdle = true
              return
            }
            if (settings.outfit !== shownOutfit) {
              shownOutfit = settings.outfit
              spinStarted = animated ? now : -1
              lastInteraction = now
            }
            if (previous !== key) lastInteraction = now
            if (
              visible &&
              document.visibilityState === 'visible' &&
              (animated || previous !== key) &&
              now - lastDraw > (renderer.info.cpuTier ? 66 : 33)
            ) {
              lastDraw = now
              const state = await avatarState(
                {
                  ...settings,
                  expression:
                    animated &&
                    settings.expression === 'neutral' &&
                    !settings.isThinking &&
                    now - lastInteraction > 25000
                      ? 'sleepy'
                      : settings.expression
                },
                (now - start) / 1000,
                animated ? pointer : [0, 0],
                animated
              )
              if (cancelled) return
              const spin =
                spinStarted < 0 ? 1 : Math.min(1, (now - spinStarted) / 650)
              if (animated && spin < 1)
                state.yaw =
                  Number(state.yaw) + (1 - Math.pow(1 - spin, 3)) * Math.PI * 2
              const colours = state.colors as number[][]
              const fromPalette = previousPalette
              if (animated && fromPalette)
                state.colors = colours.map((colour, i) =>
                  colour.map(
                    (value, j) =>
                      fromPalette[i][j] + (value - fromPalette[i][j]) * 0.16
                  )
                )
              previousPalette = state.colors as number[][]
              if (
                !renderer.isReady(Number(state.outfit)) ||
                (renderer.faceReady && !renderer.faceReady(Number(state.face)))
              ) {
                frame = requestAnimationFrame(draw)
                return
              }
              const pixels =
                size === 'small'
                  ? previewSize
                    ? Math.round(
                        previewSize * Math.min(devicePixelRatio || 1, 2)
                      )
                    : 72
                  : Math.min(
                      680,
                      Math.max(
                        200,
                        element.clientWidth * Math.min(devicePixelRatio || 1, 2)
                      )
                    )
              const result =
                size === 'small'
                  ? await renderer.drawAsync(canvas, pixels, {
                      ...state,
                      small: 1
                    })
                  : renderer.draw(null, pixels, state)
              if (result && !cancelled) {
                previous = key
                setStatus('ready')
                element.dataset.renderer = renderer.info.renderer
                element.dataset.renderedOutfit = settings.outfit
                element.dataset.renderedExpression = settings.expression
                element.dataset.renderedAppearance = settings.isDark
                  ? 'dark'
                  : 'light'
                if (
                  size === 'small' &&
                  key ===
                    JSON.stringify({
                      ...latest.current,
                      isDark:
                        document.documentElement.classList.contains('dark')
                    })
                ) {
                  snapshotIdle = true
                  return
                }
              }
            }
            if (!cancelled) frame = requestAnimationFrame(draw)
          } catch {
            if (!cancelled) setStatus('error')
          }
        }
        if (size === 'small') {
          // vx-bot/NOTE: Snapshot previews follow settings and Control Center without an idle render loop.
          redraw.current = () => {
            if (!snapshotIdle) return
            snapshotIdle = false
            frame = requestAnimationFrame(draw)
          }
          appearanceObserver = new MutationObserver(() => redraw.current?.())
          appearanceObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
          })
        }
        frame = requestAnimationFrame(draw)
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    void run()
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      appearanceObserver?.disconnect()
      document.removeEventListener('visibilitychange', resumeSnapshot)
      redraw.current = undefined
      window.removeEventListener('pointermove', followPointer)
      canvas?.remove()
      if (size === 'large')
        renderer?.gl?.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [size, previewSize])

  return (
    <div
      ref={host}
      className={`tamizhi-companion tamizhi-companion--${size}`}
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
