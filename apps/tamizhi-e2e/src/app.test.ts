import { expect, test } from '@vezham/config/playwright/test'

test.describe('tamizhi', () => {
  test('loads the application document', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('.vx-app')).toBeVisible()
    await expect(page.locator('[data-vx="app-layout"]')).toBeVisible()
    await expect(page.locator('[data-vx="menu-layout"]')).toBeVisible()
    await expect(
      page.locator('main[data-slot="app-layout-content"] > .tamizhi')
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /Who’s helping/ })
    ).toBeVisible()
  })

  test('loads an unmatched route', async ({ page }) => {
    await page.goto('/hello-world')

    await expect(page.locator('[data-vx-not-found-path]')).toHaveText(
      ': /hello-world'
    )
  })

  test('opens Playground as a right info panel beside Bookmarks', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await page.goto('/')
    const trigger = page.getByRole('button', {
      name: 'Playground',
      exact: true
    })
    const panel = page.getByRole('complementary', {
      name: 'Playground',
      exact: true
    })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(panel).toHaveCount(0)
    const chat = page.getByRole('region', { name: 'Tamizhi chat', exact: true })
    const initialChatWidth = await chat.evaluate(
      element => element.getBoundingClientRect().width
    )
    await page
      .getByRole('textbox', { name: 'Message Tamizhi' })
      .fill('Keep this draft')
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(panel).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Playground' })).toHaveCount(
      0
    )
    const panelBounds = await panel.evaluate(element => {
      const { x, width } = element.getBoundingClientRect()
      return { x, width }
    })
    const chatBounds = await chat.evaluate(element => {
      const { x, width } = element.getBoundingClientRect()
      return { x, width }
    })
    const pageRight = await page
      .locator('.tamizhi')
      .evaluate(element => element.getBoundingClientRect().right)
    expect(panelBounds.x + panelBounds.width).toBeCloseTo(pageRight, 0)
    expect(chatBounds.x + chatBounds.width).toBeLessThanOrEqual(panelBounds.x)
    expect(chatBounds.width).toBeLessThan(initialChatWidth)
    await page.getByRole('button', { name: 'Bookmarks', exact: true }).click()
    await expect(
      page.getByRole('heading', { name: 'Bookmarks', exact: true }).first()
    ).toBeVisible()
    await expect(panel).toBeVisible()
    await panel.getByRole('button', { name: 'Close Playground' }).click()
    await expect(panel).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect(
      page.getByRole('textbox', { name: 'Message Tamizhi' })
    ).toHaveValue('Keep this draft')
  })

  test('keeps Playground choices when resizing its panel into an expandable sheet', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Playground', exact: true }).click()
    const panel = page.getByRole('complementary', {
      name: 'Playground',
      exact: true
    })
    await panel.getByRole('button', { name: 'Detective', exact: true }).click()
    await panel.getByRole('button', { name: 'Wink', exact: true }).click()

    for (const width of [900, 390]) {
      await page.setViewportSize({ width, height: 960 })
      const sheet = page.getByRole('dialog', {
        name: 'Playground',
        exact: true
      })
      await expect(sheet).toBeVisible()
      await expect(panel).toHaveCount(0)
      await expect(
        sheet.getByRole('button', { name: 'Detective' })
      ).toHaveAttribute('aria-pressed', 'true')
      await expect(sheet.getByRole('button', { name: 'Wink' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
      await expect(sheet.locator('.sheet__handle')).toBeVisible()
      const collapsedHeight = await sheet.evaluate(
        element => element.getBoundingClientRect().height
      )
      await sheet.getByRole('button', { name: 'Expand Playground' }).click()
      await expect(
        sheet.getByRole('button', { name: 'Collapse Playground' })
      ).toBeVisible()
      await expect
        .poll(async () => (await sheet.boundingBox())?.height)
        .toBeGreaterThan(collapsedHeight)
      await sheet.getByRole('button', { name: 'Collapse Playground' }).click()
      await expect(
        sheet.getByRole('button', { name: 'Expand Playground' })
      ).toBeVisible()
      await sheet.getByRole('button', { name: 'Close Playground' }).click()
      await expect(sheet).toHaveCount(0)
      const trigger = page.getByRole('button', {
        name: 'Playground',
        exact: true
      })
      await expect(trigger).toBeFocused()
      await trigger.click()
    }

    await page.setViewportSize({ width: 1440, height: 960 })
    await expect(panel).toBeVisible()
    await expect(
      panel.getByRole('button', { name: 'Detective' })
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(panel.getByRole('button', { name: 'Wink' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  test('follows Control Center appearance and accent with animation paused', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await page.getByRole('button', { name: 'Playground', exact: true }).click()
    const avatar = page.locator('.tamizhi-welcome__stage .tamizhi-companion')
    const snapshot = page.locator('.tamizhi-sidebar .tamizhi-companion')
    await expect(avatar).toHaveAttribute('data-status', 'ready', {
      timeout: 30000
    })
    await expect(snapshot).toHaveAttribute('data-status', 'ready', {
      timeout: 30000
    })
    const playground = page.getByRole('complementary', {
      name: 'Playground',
      exact: true
    })
    await playground.getByText('Animation', { exact: true }).click()
    const surfaces = page.locator(
      '.tamizhi, .tamizhi-sidebar, .tamizhi-composer__form, .tamizhi__playground'
    )
    const lightSurfaces = await surfaces.evaluateAll(elements =>
      elements.map(element => getComputedStyle(element).backgroundColor)
    )
    await page.getByRole('textbox', { name: 'Message Tamizhi' }).fill('Hello')
    const send = page.getByRole('button', { name: 'Send message', exact: true })
    const originalAccent = await send.evaluate(
      element => getComputedStyle(element).backgroundColor
    )
    await page
      .getByRole('button', { name: 'Control center', exact: true })
      .click()
    const controls = page.getByRole('dialog', {
      name: 'Control Center',
      exact: true
    })
    await controls
      .getByRole('button', { name: 'Switch to dark mode', exact: true })
      .first()
      .click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(avatar).toHaveAttribute('data-rendered-appearance', 'dark')
    await expect(snapshot).toHaveAttribute('data-rendered-appearance', 'dark')
    const darkSurfaces = await surfaces.evaluateAll(elements =>
      elements.map(element => getComputedStyle(element).backgroundColor)
    )
    for (const [index, colour] of darkSurfaces.entries())
      expect(colour).not.toBe(lightSurfaces[index])

    await controls.getByRole('button', { name: 'Theme', exact: true }).click()
    await controls.getByRole('option', { name: 'Purple', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute(
      'data-vx-theme-color',
      'purple'
    )
    await send.evaluate(element =>
      Promise.all(element.getAnimations().map(animation => animation.finished))
    )
    await expect(send).not.toHaveCSS('background-color', originalAccent)
    const selectedAccent = await send.evaluate(
      element => getComputedStyle(element).backgroundColor
    )
    await page.keyboard.press('Escape')
    await playground.getByRole('button', { name: 'Honey', exact: true }).click()
    await expect(send).toHaveCSS('background-color', selectedAccent)
    await expect(page.locator('.tamizhi')).not.toHaveClass(/dark|light/)

    await page
      .getByRole('button', { name: 'Control center', exact: true })
      .click()
    await controls
      .getByRole('button', { name: 'Switch to light mode', exact: true })
      .first()
      .click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    await expect(avatar).toHaveAttribute('data-rendered-appearance', 'light')
    await expect(snapshot).toHaveAttribute('data-rendered-appearance', 'light')
    expect(
      await surfaces.evaluateAll(elements =>
        elements.map(element => getComputedStyle(element).backgroundColor)
      )
    ).toEqual(lightSurfaces)
    await expect(send).toHaveCSS('background-color', selectedAccent)
  })

  test('follows system appearance while Control Center Auto is selected', async ({
    page
  }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    const lightBackground = await page
      .locator('.tamizhi')
      .evaluate(element => getComputedStyle(element).backgroundColor)
    await page
      .getByRole('button', { name: 'Control center', exact: true })
      .click()
    const controls = page.getByRole('dialog', {
      name: 'Control Center',
      exact: true
    })
    await controls
      .getByRole('button', { name: 'Appearance', exact: true })
      .first()
      .click()
    await controls.getByRole('button', { name: 'Auto', exact: true }).click()
    await page.keyboard.press('Escape')
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme-mode',
      'auto'
    )
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.locator('.tamizhi')).not.toHaveCSS(
      'background-color',
      lightBackground
    )
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    await expect(page.locator('.tamizhi')).toHaveCSS(
      'background-color',
      lightBackground
    )
  })

  test('saves a planning conversation and its checked steps locally', async ({
    page
  }) => {
    await page.goto('/')
    await page
      .getByRole('navigation', { name: 'Example conversations' })
      .getByRole('button', { name: /Make a plan/ })
      .click()
    const step = page.getByRole('checkbox', {
      name: 'Pick one meaningful priority for today'
    })
    await page
      .getByText('Pick one meaningful priority for today', { exact: true })
      .click()
    await expect(step).toBeChecked()
    await expect(page.getByText('1 of 5 small steps complete')).toBeVisible()
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem('tamizhi.demo.v1') || '[]')[0]
              ?.messages[1]?.tasks[0]?.done
        )
      )
      .toBe(true)

    await page.reload()
    await page
      .getByRole('navigation', { name: 'Saved conversations' })
      .getByRole('button', {
        name: 'Help me plan a focused and balanced day.',
        exact: true
      })
      .click()
    await expect(step).toBeChecked()
    await page
      .getByRole('button', {
        name: 'Delete Help me plan a focused and balanced day.'
      })
      .click()
    await expect(
      page.getByRole('heading', {
        name: /Who’s helping/
      })
    ).toBeVisible()
    await expect(
      page.getByRole('navigation', { name: 'Saved conversations' })
    ).toHaveCount(0)
  })

  test('stops a reply and retries it without duplicating the prompt', async ({
    page
  }) => {
    await page.goto('/')
    await page
      .getByRole('textbox', { name: 'Message Tamizhi' })
      .fill('Help me build a React portfolio')
    await page
      .getByRole('button', { name: 'Send message', exact: true })
      .click()
    await page
      .getByRole('button', { name: 'Stop response', exact: true })
      .click()
    await expect(
      page.getByRole('button', { name: 'Stop response' })
    ).toHaveCount(0)
    await page.getByRole('button', { name: 'Try response again' }).click()
    await expect(
      page.getByText('Start with the content. The details can grow from there.')
    ).toBeVisible()
    await expect(
      page.getByRole('article', { name: 'Your message' })
    ).toHaveCount(1)
    await expect(page.getByText('Builder mode', { exact: true })).toBeVisible()
  })

  test('supports mobile navigation and the original avatar controls', async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(
      page.getByRole('group', { name: 'Mobile navigation controls' })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Open conversations' }).click()
    const conversations = page.getByRole('dialog', {
      name: 'Conversations',
      exact: true
    })
    await expect(conversations).toBeVisible()
    await conversations
      .getByRole('button', { name: 'New chat', exact: true })
      .click()
    await expect(conversations).toHaveCount(0)
    await page.getByRole('button', { name: 'Playground', exact: true }).click()
    const playground = page.getByRole('dialog', {
      name: 'Playground',
      exact: true
    })
    await playground
      .getByRole('button', { name: 'Traveller', exact: true })
      .click()
    await expect(
      page.locator('.tamizhi-welcome__stage [data-outfit="traveller"]')
    ).toBeVisible()
    await playground.getByRole('button', { name: 'Wink', exact: true }).click()
    await expect(
      page.locator('.tamizhi-welcome__stage [data-expression="wink"]')
    ).toBeVisible()
    await playground.getByText('Animation', { exact: true }).click()
    await expect(
      playground.getByRole('switch', { name: 'Animation' })
    ).not.toBeChecked()
    await expect(
      page.locator('.tamizhi-welcome__stage [data-animated="false"]')
    ).toBeVisible()
    await playground.getByRole('tab', { name: 'Offline', exact: true }).click()
    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('textbox', { name: 'Message Tamizhi' })
    ).toBeDisabled()
    await expect(page.locator('.tamizhi')).not.toHaveClass(/dark|light/)
    expect(
      await page.locator('html').evaluate(element => element.scrollWidth)
    ).toBeLessThanOrEqual(390)
  })

  test('renders the original mesh and switches task outfits and expressions', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Playground', exact: true }).click()
    const avatar = page.locator('.tamizhi-welcome__stage .tamizhi-companion')
    await expect(avatar).toHaveAttribute('data-status', 'ready', {
      timeout: 30000
    })
    await expect(avatar).toHaveAttribute('data-renderer', 'mesh')
    const playground = page.getByRole('complementary', {
      name: 'Playground',
      exact: true
    })
    await playground.getByText('Animation', { exact: true }).click()
    const resting = await avatar.screenshot()
    for (const [name, id] of [
      ['Chef', 'cook'],
      ['Builder', 'builder'],
      ['Bug finder', 'bug']
    ]) {
      await playground.getByRole('button', { name: 'Choose outfit' }).click()
      await playground.getByRole('menuitemradio', { name, exact: true }).click()
      await expect(avatar).toHaveAttribute('data-rendered-outfit', id, {
        timeout: 30000
      })
      expect((await avatar.screenshot()).equals(resting)).toBe(false)
    }
    await playground.getByRole('button', { name: 'Choose expression' }).click()
    await playground.getByRole('menuitemradio', { name: 'Wink' }).click()
    await expect(avatar).toHaveAttribute('data-rendered-expression', 'wink')
    await page.getByRole('button', { name: 'New bot', exact: true }).click()
    await page.getByRole('textbox', { name: /^Name/ }).fill('Kitchen helper')
    await page
      .getByRole('textbox', { name: 'What it helps with', exact: true })
      .fill('Cooking recipes')
    await page.getByRole('button', { name: 'Create bot', exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Choose a bot' })
    ).toContainText('Kitchen helper')
    await expect(avatar).toHaveAttribute('data-rendered-outfit', 'cook')
  })

  for (const width of [1440, 390]) {
    test(`updates all avatar-size previews and resets appearance at ${width}px`, async ({
      page
    }) => {
      await page.setViewportSize({ width, height: 960 })
      await page.goto('/')
      await page
        .getByRole('button', { name: 'Playground', exact: true })
        .click()
      const playground = page.locator('#tamizhi-playground')
      await playground.getByRole('button', { name: 'Choose outfit' }).click()
      await playground.getByRole('menuitemradio', { name: 'Chef' }).click()
      await playground
        .getByRole('button', { name: 'Choose expression' })
        .click()
      await playground.getByRole('menuitemradio', { name: 'Wink' }).click()
      for (const pixels of [72, 44, 28]) {
        const preview = playground.getByRole('figure', {
          name: `${pixels}px avatar preview`,
          exact: true
        })
        await preview.scrollIntoViewIfNeeded()
        const avatar = preview.locator('.tamizhi-companion')
        await expect(avatar).toHaveAttribute('data-status', 'ready', {
          timeout: 30000
        })
        await expect(avatar).toHaveCSS('width', `${pixels}px`)
        await expect(avatar).toHaveAttribute('data-rendered-outfit', 'cook')
        await expect(avatar).toHaveAttribute('data-rendered-expression', 'wink')
      }
      const preview = playground.getByRole('figure', {
        name: '72px avatar preview',
        exact: true
      })
      const honey = await preview.screenshot()
      await playground
        .getByRole('button', { name: 'Rose', exact: true })
        .click()
      await preview.scrollIntoViewIfNeeded()
      await expect
        .poll(async () => (await preview.screenshot()).equals(honey))
        .toBe(false)
      await playground
        .getByRole('button', { name: 'Honey', exact: true })
        .click()
      await expect(
        playground.getByRole('button', { name: 'Honey', exact: true })
      ).toHaveAttribute('aria-pressed', 'true')
      await preview.scrollIntoViewIfNeeded()
      await expect
        .poll(async () => (await preview.screenshot()).equals(honey))
        .toBe(true)
      await playground
        .getByRole('button', { name: 'Choose expression' })
        .click()
      await playground.getByRole('menuitemradio', { name: 'Neutral' }).click()
      await preview.scrollIntoViewIfNeeded()
      await expect(preview.locator('.tamizhi-companion')).toHaveAttribute(
        'data-rendered-expression',
        'neutral'
      )
      const online = await preview.screenshot()
      await playground
        .getByRole('tab', { name: 'Offline', exact: true })
        .click()
      await preview.scrollIntoViewIfNeeded()
      await expect
        .poll(async () => (await preview.screenshot()).equals(online))
        .toBe(false)
      expect(
        await page.locator('html').evaluate(element => element.scrollWidth)
      ).toBeLessThanOrEqual(width)
    })
  }

  test('previews Brain setup for the session while using local demo replies', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await page.goto('/')
    const trigger = page.getByRole('button', {
      name: 'Playground',
      exact: true
    })
    await trigger.click()
    const playground = page.locator('#tamizhi-playground')
    const key = playground.getByLabel('Provider API key', { exact: true })
    await expect(key).toHaveAttribute('type', 'password')
    await expect(
      playground.getByRole('button', { name: 'Save API key' })
    ).toBeDisabled()
    const previewKey = 'demo-preview-key-1234'
    await key.fill(previewKey)
    await playground.getByRole('button', { name: 'Save API key' }).click()
    await expect(playground.getByLabel('Saved API key')).toHaveText('•••• 1234')
    const stored = await page.evaluate(() =>
      JSON.stringify([localStorage, sessionStorage])
    )
    expect(stored).not.toContain(previewKey)
    await playground.getByRole('button', { name: 'Close Playground' }).click()
    await trigger.click()
    await expect(playground.getByLabel('Saved API key')).toHaveText('•••• 1234')
    await playground.getByRole('button', { name: 'Remove API key' }).click()
    await expect(key).toHaveValue('')
    await key.fill(previewKey)
    await playground.getByRole('button', { name: 'Save API key' }).click()
    await playground.getByRole('tab', { name: 'Instant', exact: true }).click()
    await page
      .getByRole('textbox', { name: 'Message Tamizhi' })
      .fill('Suggest a quick dinner recipe')
    await page
      .getByRole('button', { name: 'Send message', exact: true })
      .click()
    await expect(page.getByText(/tomato and egg toast/).first()).toBeVisible()
    await expect(
      playground.getByText('Last pick: Chef', { exact: true })
    ).toBeVisible()
    await expect(
      playground.getByText('Source: local rules', { exact: true })
    ).toBeVisible()
    await page.reload()
    await trigger.click()
    await expect(key).toHaveValue('')
    await expect(playground.getByLabel('Saved API key')).toHaveCount(0)
  })

  test('uses the Canvas fallback when WebGL is unavailable', async ({
    page
  }) => {
    await page.addInitScript(`
      const original = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
        if (kind === 'webgl2') return null
        return Reflect.apply(original, this, [kind, ...args])
      }
    `)
    await page.goto('/')
    const avatar = page.locator('.tamizhi-welcome__stage .tamizhi-companion')
    await expect(avatar).toHaveAttribute('data-status', 'ready', {
      timeout: 30000
    })
    await expect(avatar).toHaveAttribute('data-renderer', 'canvas')
    expect((await avatar.screenshot()).byteLength).toBeGreaterThan(4000)
  })
})
