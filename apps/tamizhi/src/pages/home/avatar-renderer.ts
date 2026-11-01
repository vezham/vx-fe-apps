import { EXPRESSIONS, OUTFITS } from './avatar-data'
import type { Expression, Outfit } from './avatar-data'

type RenderState = Record<
  string,
  number | boolean | string | number[] | number[][]
>
export interface AvatarRenderer {
  canvas: HTMLCanvasElement
  gl?: WebGL2RenderingContext
  info: { renderer: string; lost: boolean; cpuTier?: boolean }
  isReady: (outfit?: number) => boolean
  faceReady?: (face: number) => boolean
  preload: () => Promise<unknown>
  draw: (
    target: HTMLCanvasElement | null,
    pixels: number,
    state: RenderState
  ) => HTMLCanvasElement | null
  drawAsync: (
    target: HTMLCanvasElement,
    pixels: number,
    state: RenderState
  ) => Promise<HTMLCanvasElement | null>
}
interface EngineModule {
  createRenderer: (options: { base: string }) => AvatarRenderer
  PALETTES: Record<string, string[]>
}
const BASE = `${import.meta.env.BASE_URL}momo`
let enginePromise: Promise<EngineModule> | undefined
let snapshotPromise: Promise<AvatarRenderer> | undefined

const loadEngine = () =>
  (enginePromise ??= import(
    // eslint-disable-next-line @vx-lint/comment-style -- Vite requires this exact runtime import directive.
    /* @vite-ignore */ `${BASE}/engine/mesh.js`
  ) as Promise<EngineModule>)

export const createAvatarRenderer = async () => {
  const engine = await loadEngine()
  try {
    return engine.createRenderer({ base: BASE })
  } catch {
    const fallback = (await import(
      // eslint-disable-next-line @vx-lint/comment-style -- Vite requires this exact runtime import directive.
      /* @vite-ignore */ `${BASE}/engine/canvas.js`
    )) as EngineModule
    return fallback.createRenderer({ base: BASE })
  }
}

export const getSnapshotRenderer = () =>
  (snapshotPromise ??= createAvatarRenderer())

export interface AvatarState {
  outfit: Outfit
  expression: Expression
  connectionReaction?:
    | 'disconnect-surprised'
    | 'disconnect-dizzy'
    | 'disconnect-settle'
    | 'reconnect-wait'
    | 'reconnect-surprised'
    | 'reconnect-recover'
    | 'reconnect-happy'
    | null
  connectionReactionProgress?: number
  palette?: string
  isThinking: boolean
  isOffline: boolean
  isDark: boolean
}

export const buildAvatarRenderState = (
  state: AvatarState,
  time: number,
  look: number[],
  animated: boolean,
  palettes: Record<string, string[]>
): RenderState => {
  const outfit = OUTFITS.find(item => item.id === state.outfit) ?? OUTFITS[0]
  const palette =
    palettes[state.isOffline ? 'ash' : (state.palette ?? outfit.palette)] ??
    palettes.persimmon
  const expression =
    EXPRESSIONS.find(item => item.id === state.expression) ?? EXPRESSIONS[0]
  const t = animated ? time : 0
  const blinkPhase = t % 4.4
  const blink =
    blinkPhase > 4.16 ? Math.sin(((blinkPhase - 4.16) / 0.24) * Math.PI) : 0
  const isWink = state.expression === 'wink'
  const isSleepy = state.expression === 'sleepy'
  const hasConnectionKick =
    state.connectionReaction === 'disconnect-surprised' ||
    state.connectionReaction === 'reconnect-recover'
  const connectionPulse = Math.sin(
    Math.PI * (state.connectionReactionProgress ?? 0)
  )
  const connectionWiggle =
    state.connectionReaction === 'reconnect-happy'
      ? Math.sin((state.connectionReactionProgress ?? 0) * Math.PI * 6) *
        connectionPulse
      : 0
  const connectionDizzy =
    state.connectionReaction === 'disconnect-dizzy'
      ? Math.sin((state.connectionReactionProgress ?? 0) * Math.PI * 4) * 0.13
      : 0
  return {
    outfit: outfit.code,
    face: state.isOffline
      ? 4
      : state.expression === 'neutral'
        ? outfit.code === 1 || outfit.code === 6
          ? 1
          : outfit.code === 2
            ? 2
            : 0
        : expression.face,
    colors: palette.map(hex =>
      [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
    ),
    time: t,
    look,
    yaw: look[0] * 0.8 + Math.sin(t * 0.5) * 0.025 + connectionWiggle * 0.035,
    roll:
      state.connectionReaction === 'disconnect-dizzy'
        ? connectionDizzy
        : state.expression === 'dizzy'
          ? Math.sin(t * 11) * 0.13
          : state.isThinking
            ? 0.06
            : isWink
              ? 0.09
              : Math.sin(t * 0.7) * 0.018 + connectionWiggle * 0.06,
    squash: state.isOffline
      ? 0
      : Math.sin(t * 1.65) * (isSleepy ? 0.3 : 0.1) +
        (hasConnectionKick ? connectionPulse * 0.12 : 0),
    blink: state.isOffline || isSleepy || isWink ? 0 : blink,
    dead: state.isOffline ? 1 : 0,
    fall: state.isOffline ? 1 : 0,
    lift: hasConnectionKick ? connectionPulse * 0.035 : 0,
    tip: state.isOffline
      ? [1.2, 0.25, 0.86]
      : ['builder', 'designer', 'director', 'money', 'guard'].includes(
            state.outfit
          )
        ? [-0.2, 0, 0.62]
        : isSleepy
          ? [0.32, 0.14, 0.95]
          : state.isThinking
            ? [-0.16, 0.18, 0.97]
            : [Math.sin(t * 0.7) * 0.025, 0, 1],
    smile: state.expression === 'happy' ? 1 : 0,
    sleepy: isSleepy ? 1 : 0,
    wink: isWink ? 1 : 0,
    lids: isWink ? [1, 0] : [0, 0],
    glow: state.expression === 'sparkle' ? 1 : 0,
    eyeScale: state.expression === 'surprised' ? [1.27, 1.02] : [1, 1],
    brows:
      state.expression === 'surprised'
        ? [0.09, 0.11, 0.11, 0.09]
        : state.isThinking
          ? [0.008, 0.01, 0.028, 0.034]
          : [0.012, 0.014, 0.014, 0.012],
    browOn: state.isThinking || state.expression !== 'neutral' ? 1 : 0,
    restMouth: true,
    small: 0,
    fuzz: 1,
    darkFloor: state.isDark ? 1 : 0,
    leaf: state.isThinking ? 1 : 0.5,
    glassY: state.outfit === 'tutor' ? (t % 8) * 0.006 : 0,
    hatTilt: Math.sin(t * 0.7) * 0.01,
    bug: 1,
    ant: [1, Math.sin(t * 2) * 0.05, -Math.sin(t * 2) * 0.05],
    legL: [0, 0, 0],
    legR: [0, 0, 0]
  }
}

export const avatarState = async (
  state: AvatarState,
  time: number,
  look: number[],
  animated: boolean
): Promise<RenderState> => {
  const engine = await loadEngine()
  return buildAvatarRenderState(state, time, look, animated, engine.PALETTES)
}
