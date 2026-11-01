import { EXPRESSIONS, OUTFITS, PALETTE_COLOURS } from './avatar-data'
import type { Expression } from './avatar-data'
import { buildAvatarRenderState } from './avatar-renderer'
import type { AvatarState } from './avatar-renderer'

const paletteIds = [...new Set([...Object.keys(PALETTE_COLOURS), 'ash'])]
const toHex = (value: number) => value.toString(16).padStart(2, '0')
const palettes = Object.fromEntries(
  paletteIds.map((id, paletteIndex) => [
    id,
    Array.from({ length: 5 }, (_, colorIndex) => {
      const red = (paletteIndex * 19 + colorIndex * 37) % 256
      const green = (paletteIndex * 43 + colorIndex * 23) % 256
      const blue = (paletteIndex * 61 + colorIndex * 11) % 256
      return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
    })
  ])
)
const toRenderColours = (id: string) =>
  palettes[id].map(hex =>
    [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
  )
const neutralFace = (outfitCode: number) =>
  outfitCode === 1 || outfitCode === 6 ? 1 : outfitCode === 2 ? 2 : 0

const reactionStates = (expression: Expression) =>
  [
    { connectionReaction: null, isOffline: false, expression },
    {
      connectionReaction: 'disconnect-surprised',
      isOffline: false,
      expression: 'surprised'
    },
    {
      connectionReaction: 'disconnect-dizzy',
      isOffline: false,
      expression: 'dizzy'
    },
    {
      connectionReaction: 'disconnect-settle',
      isOffline: true,
      expression
    },
    {
      connectionReaction: 'reconnect-wait',
      isOffline: true,
      expression
    },
    {
      connectionReaction: 'reconnect-surprised',
      isOffline: true,
      expression
    },
    {
      connectionReaction: 'reconnect-recover',
      isOffline: false,
      expression: 'surprised'
    },
    {
      connectionReaction: 'reconnect-happy',
      isOffline: false,
      expression: 'happy'
    }
  ] as const

describe('buildAvatarRenderState', () => {
  it('keeps every outfit, expression, and palette through connection reactions', () => {
    for (const outfit of OUTFITS) {
      for (const selectedExpression of EXPRESSIONS) {
        for (const palette of paletteIds.filter(id => id !== 'ash')) {
          for (const reaction of reactionStates(selectedExpression.id)) {
            const state: AvatarState = {
              outfit: outfit.id,
              palette,
              isThinking: false,
              isDark: false,
              ...reaction,
              connectionReactionProgress: 0.5
            }
            const rendered = buildAvatarRenderState(
              state,
              1,
              [0, 0],
              true,
              palettes
            )
            const renderedExpression = reaction.expression as Expression
            const expectedFace = reaction.isOffline
              ? 4
              : renderedExpression === 'neutral'
                ? neutralFace(outfit.code)
                : (EXPRESSIONS.find(item => item.id === renderedExpression)
                    ?.face ?? 0)

            expect({
              outfit: rendered.outfit,
              face: rendered.face,
              colors: rendered.colors
            }).toEqual({
              outfit: outfit.code,
              face: expectedFace,
              colors: toRenderColours(reaction.isOffline ? 'ash' : palette)
            })
          }
        }
      }
    }
  })
})
