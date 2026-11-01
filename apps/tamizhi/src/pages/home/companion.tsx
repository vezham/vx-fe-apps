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

type ConnectionReactionPhase =
  | 'disconnect-surprised'
  | 'disconnect-dizzy'
  | 'disconnect-settle'
  | 'reconnect-wait'
  | 'reconnect-surprised'
  | 'reconnect-recover'
  | 'reconnect-happy'
type ConnectionReaction = {
  phase: ConnectionReactionPhase
  startedAt: number
} | null

const CONNECTION_REACTION_DURATIONS: Record<ConnectionReactionPhase, number> = {
  'disconnect-surprised': 420,
  'disconnect-dizzy': 700,
  'disconnect-settle': 350,
  'reconnect-wait': 840,
  'reconnect-surprised': 260,
  'reconnect-recover': 420,
  'reconnect-happy': 1000
}

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
  const host = useRef<HTMLDivElement>(null)
  const redraw = useRef<(() => void) | undefined>(undefined)
  const [connectionReaction, setConnectionReaction] =
    useState<ConnectionReaction>(null)
  const latest = useRef({
    outfit,
    expression,
    palette,
    isListening,
    isThinking,
    isOffline,
    isAnimated,
    focusTarget,
    connectionReaction
  })
  const previousOffline = useRef(isOffline)
  const [status, setStatus] = useState('loading')
  useEffect(() => {
    latest.current = {
      outfit,
      expression,
      palette,
      isListening,
      isThinking,
      isOffline,
      isAnimated,
      focusTarget,
      connectionReaction
    }
    redraw.current?.()
  }, [
    outfit,
    expression,
    palette,
    isListening,
    isThinking,
    isOffline,
    isAnimated,
    focusTarget,
    connectionReaction
  ])

  useEffect(() => {
    if (previousOffline.current === isOffline) return
    previousOffline.current = isOffline
    if (
      size !== 'large' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      const resetTimer = window.setTimeout(() => setConnectionReaction(null), 0)
      return () => window.clearTimeout(resetTimer)
    }

    const timers: number[] = []
    const beginReaction = (phase: ConnectionReactionPhase) =>
      setConnectionReaction({ phase, startedAt: performance.now() })
    if (isOffline) {
      beginReaction('disconnect-surprised')
      timers.push(
        window.setTimeout(() => beginReaction('disconnect-dizzy'), 420),
        window.setTimeout(() => beginReaction('disconnect-settle'), 1120),
        window.setTimeout(() => setConnectionReaction(null), 1470)
      )
    } else {
      beginReaction('reconnect-wait')
      timers.push(
        window.setTimeout(() => beginReaction('reconnect-surprised'), 840),
        window.setTimeout(() => beginReaction('reconnect-recover'), 1100),
        window.setTimeout(() => beginReaction('reconnect-happy'), 1520),
        window.setTimeout(() => setConnectionReaction(null), 2520)
      )
    }
    return () => timers.forEach(window.clearTimeout)
  }, [isOffline, size])

  useEffect(() => {
    const element = host.current
    if (!element || import.meta.env.MODE === 'test') return
    let cancelled = false
    let frame = 0
    let renderer: AvatarRenderer | undefined
    let canvas: HTMLCanvasElement | undefined
    let shownFace: number | undefined
    let faceOverlay: HTMLCanvasElement | undefined
    let faceOverlayTimer: number | undefined
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
        const previousMotion = new Map<string, number | number[]>()
        let snapshotIdle = false
        const smoothMotion = (
          state: Awaited<ReturnType<typeof avatarState>>
        ) => {
          const smoothed = { ...state }
          for (const field of [
            'yaw',
            'roll',
            'squash',
            'dead',
            'fall',
            'lift'
          ] as const) {
            const target = state[field]
            const previous = previousMotion.get(field)
            if (typeof target === 'number') {
              const value =
                typeof previous === 'number'
                  ? previous + (target - previous) * 0.2
                  : target
              smoothed[field] = value
              previousMotion.set(field, value)
            }
          }
          const targetTip = state.tip as number[]
          const previousTip = previousMotion.get('tip')
          const oldTip = Array.isArray(previousTip) ? previousTip : targetTip
          const tip = targetTip.map(
            (value, index) =>
              (oldTip[index] ?? value) +
              (value - (oldTip[index] ?? value)) * 0.2
          )
          smoothed.tip = tip
          previousMotion.set('tip', tip)
          return smoothed
        }
        const draw = async (now: number) => {
          if (cancelled || !renderer || !canvas) return
          try {
            const { focusTarget, ...renderSettings } = latest.current
            const settings = {
              ...renderSettings,
              isDark: document.documentElement.classList.contains('dark')
            }
            const key = JSON.stringify(settings)
            const reaction = settings.connectionReaction?.phase
            const reactionProgress = settings.connectionReaction
              ? Math.max(
                  0,
                  Math.min(
                    1,
                    (now - settings.connectionReaction.startedAt) /
                      CONNECTION_REACTION_DURATIONS[
                        settings.connectionReaction.phase
                      ]
                  )
                )
              : 0
            const reacting = size === 'large' && !!reaction
            const animated =
              size === 'large' &&
              !reduced.matches &&
              (settings.isAnimated || reacting)
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
              const reactionExpression: Expression | undefined =
                reaction === 'disconnect-surprised' ||
                reaction === 'reconnect-surprised' ||
                reaction === 'reconnect-recover'
                  ? 'surprised'
                  : reaction === 'disconnect-dizzy'
                    ? 'dizzy'
                    : reaction === 'reconnect-happy'
                      ? 'happy'
                      : undefined
              const keepOfflineLook =
                reaction === 'reconnect-wait' ||
                reaction === 'reconnect-surprised'
              let look = animated ? pointer : [0, 0]
              if (animated && settings.isThinking) look = [-0.045, 0.055]
              else if (animated && settings.isListening) {
                const targetBounds = focusTarget?.getBoundingClientRect()
                const bounds = element.getBoundingClientRect()
                if (targetBounds) {
                  const dx =
                    targetBounds.left +
                    targetBounds.width / 2 -
                    (bounds.left + bounds.width / 2)
                  const dy =
                    targetBounds.top +
                    targetBounds.height / 2 -
                    (bounds.top + bounds.height / 2)
                  const distance = Math.hypot(dx, dy) || 1
                  look = [(dx / distance) * 0.05, (-dy / distance) * 0.045]
                } else look = [0.035, -0.05]
              }
              const state = await avatarState(
                {
                  ...settings,
                  connectionReaction: reaction,
                  connectionReactionProgress: reactionProgress,
                  isOffline:
                    keepOfflineLook ||
                    (settings.isOffline &&
                      reaction !== 'disconnect-surprised' &&
                      reaction !== 'disconnect-dizzy'),
                  expression:
                    reactionExpression ??
                    (animated &&
                    settings.expression === 'neutral' &&
                    !settings.isThinking &&
                    now - lastInteraction > 25000
                      ? 'sleepy'
                      : settings.expression)
                },
                (now - start) / 1000,
                look,
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
              if (
                size === 'large' &&
                !reduced.matches &&
                shownFace !== undefined &&
                shownFace !== Number(state.face)
              ) {
                faceOverlay?.remove()
                if (faceOverlayTimer !== undefined)
                  window.clearTimeout(faceOverlayTimer)
                const overlay = document.createElement('canvas')
                overlay.width = canvas.width
                overlay.height = canvas.height
                overlay.className = 'tamizhi-companion__face-transition'
                overlay.setAttribute('aria-hidden', 'true')
                overlay.getContext('2d')?.drawImage(canvas, 0, 0)
                element.appendChild(overlay)
                faceOverlay = overlay
                requestAnimationFrame(() => {
                  overlay.classList.add(
                    'tamizhi-companion__face-transition--fade'
                  )
                })
                faceOverlayTimer = window.setTimeout(() => {
                  overlay.remove()
                  if (faceOverlay === overlay) faceOverlay = undefined
                }, 180)
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
              const renderState =
                animated &&
                (reacting ||
                  settings.isOffline ||
                  settings.isListening ||
                  settings.isThinking)
                  ? smoothMotion(state)
                  : state
              const result =
                size === 'small'
                  ? await renderer.drawAsync(canvas, pixels, {
                      ...renderState,
                      small: 1
                    })
                  : renderer.draw(null, pixels, renderState)
              if (result && !cancelled) {
                previous = key
                shownFace = Number(state.face)
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
      if (faceOverlayTimer !== undefined) window.clearTimeout(faceOverlayTimer)
      faceOverlay?.remove()
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
