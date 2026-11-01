import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDemoChat } from './use-demo-chat'

const mountChat = () => {
  const hook = renderHook(useDemoChat)
  act(() => vi.advanceTimersByTime(0))
  return hook
}

describe('Tamizhi local conversations', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('streams a prepared response and ignores a duplicate send while busy', () => {
    const { result } = mountChat()
    act(() => result.current.send('Hello'))
    expect(result.current.isStreaming).toBe(true)
    act(() => result.current.send('Another message'))
    expect(
      result.current.messages.filter(message => message.role === 'user')
    ).toHaveLength(1)
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.isStreaming).toBe(false)
    expect(result.current.messages[1].text).toContain('Vanakkam')
  })

  it('stops a partial reply and retries without duplicating the user message', () => {
    const { result } = mountChat()
    act(() => result.current.send('Build a React portfolio'))
    act(() => vi.advanceTimersByTime(70))
    act(() => result.current.stop())
    const partial = result.current.messages[1].text
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.messages[1].text).toBe(partial)
    act(() => result.current.retry())
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1].text.length).toBeGreaterThan(
      partial.length
    )
    expect(result.current.persona).toBe('coder')
  })

  it('starts an example in a separate conversation and cancels the previous stream', () => {
    const { result } = mountChat()
    act(() => result.current.send('Write an introduction'))
    const firstId = result.current.activeId ?? ''
    act(() => result.current.send('Plan my day', 'planner', true))
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.conversations).toHaveLength(2)
    expect(result.current.persona).toBe('planner')
    act(() => result.current.selectChat(firstId))
    expect(result.current.messages[1].text).toBe('Response stopped.')
    expect(result.current.isStreaming).toBe(false)
  })

  it('restores history and checked planning steps after remounting', () => {
    const first = mountChat()
    act(() => first.result.current.send('Plan a balanced day'))
    act(() => vi.advanceTimersByTime(5000))
    const chatId = first.result.current.activeId ?? ''
    const replyId = first.result.current.messages[1].id
    act(() => first.result.current.toggleTask(replyId, 0, true))
    act(() => vi.advanceTimersByTime(200))
    first.unmount()

    const second = mountChat()
    act(() => second.result.current.selectChat(chatId))
    expect(second.result.current.messages[1].tasks?.[0].done).toBe(true)
    act(() => second.result.current.deleteChat(chatId))
    expect(second.result.current.conversations).toHaveLength(0)
    expect(second.result.current.messages).toHaveLength(0)
  })

  it('recovers from malformed saved data without preventing a new conversation', () => {
    localStorage.setItem('tamizhi.demo.v1', '{invalid')
    const { result } = mountChat()
    expect(result.current.isReady).toBe(true)
    expect(result.current.conversations).toHaveLength(0)
    act(() => result.current.send('Hello'))
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.messages).toHaveLength(2)
  })

  it('returns a complete reply immediately when Instant is selected', () => {
    const { result } = renderHook(() => useDemoChat(true))
    act(() => vi.advanceTimersByTime(0))
    act(() => result.current.send('Suggest a quick dinner recipe'))
    expect(result.current.isStreaming).toBe(false)
    expect(result.current.messages[1].text).toContain('tomato and egg toast')
    expect(result.current.messages[1].outfit).toBe('cook')
  })

  it('uses route selection and cancels a stream when leaving its conversation', () => {
    const initialProps: { chatId: string | null } = { chatId: null }
    const hook = renderHook(
      ({ chatId }: { chatId: string | null }) => useDemoChat(false, chatId),
      { initialProps }
    )
    act(() => vi.advanceTimersByTime(0))
    let createdId: string | undefined
    act(() => {
      createdId = hook.result.current.send('Help me plan today')
    })
    expect(createdId).toBeTruthy()
    expect(hook.result.current.activeId).toBeNull()
    hook.rerender({ chatId: createdId ?? null })
    expect(hook.result.current.isStreaming).toBe(true)
    act(() => vi.advanceTimersByTime(70))
    const partial = hook.result.current.messages[1].text

    hook.rerender({ chatId: null })
    expect(hook.result.current.messages).toHaveLength(0)
    expect(hook.result.current.isStreaming).toBe(false)
    act(() => vi.advanceTimersByTime(5000))
    hook.rerender({ chatId: createdId ?? null })
    expect(hook.result.current.messages[1].text).toBe(partial)
  })
})
