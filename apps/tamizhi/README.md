# Tamizhi

Our AI assistant proof of concept, inspired by [Momo](https://feralui.dev/momo).
Stage one is a local demo for reviewing and locking the interface before adding
an AI provider.

The shared `AppLayout` retains the app menu, navigation, Control Center, and
Settings. The reference-inspired demo belongs only to the home page content.

Run `pnpm nx run tamizhi:serve` to open the app.

- Chat with prepared replies, simulated streaming, stop, retry, and copy.
- Try Builder, Writer, Planner, Teacher, and Explorer examples.
- Use Momo's original 3D avatar with all 17 task outfits, the resting look,
  seven expressions, six colour options, and offline mode. Animation respects
  reduced motion and can also be turned off manually.
- Reset expressions to Neutral or restore the outfit's default colour.
  Preview the current avatar at 72px, 44px, and 28px, including its outfit,
  expression, colour, connection state, and Control Center appearance.
- Preview Brain setup with a masked API key and Save/Remove controls. The key
  stays in page memory for this session and is never sent or written to browser
  storage. Chat continues to use local demo replies. Last pick shows the outfit
  chosen for the current conversation's latest prompt.
- Complete planning checklists, return to saved conversations, or delete them.
- Choose Stream or Instant replies. Use the conversation drawer on mobile.
- Open Playground from the chat header: a closable right info panel on large
  screens, or a bottom sheet below 1024px. The sheet supports Expand, Collapse,
  a drag handle, and a fixed header above its scrolling controls. Avatar choices
  stay selected when closing, reopening, or resizing the panel.
- Match the reference's neutral page layout, bot picker, and compact composer.
  Light, Dark, Auto, and accent colours follow the shared Control Center.
  Avatar colours stay independent of the interface theme; its floor shadow
  follows appearance, including when animation is paused.

Messages remain in browser storage under `tamizhi.demo.v1`. The demo keeps up to
24 conversations and the latest 60 messages per conversation. When storage is
unavailable, chat remains usable for the current session. No AI requests are made.

UI primitives come from `@vezham/react-v3`, with compound components written using
dot notation. The demo reply data and conversation state live beside the home
page, separate from the rendering components for the later provider stage.

The unmodified Momo WebGL renderer, Canvas 2D fallback, shaders, rig, and meshes
live in `public/momo/`. Their MIT notices are retained beside the source and
meshoptimizer decoder. The React adapter in `companion.tsx` owns mounting,
animation, pointer tracking, reduced motion, and WebGL cleanup. Small avatars
share one snapshot renderer; off-screen animation pauses. No avatar assets are
requested from the reference site at runtime.

Validation:

```sh
pnpm nx run tamizhi:typecheck
pnpm nx run tamizhi:lint
pnpm nx run tamizhi:test --run
pnpm nx run tamizhi:build
BASE_URL=http://localhost:8080 pnpm nx run tamizhi-e2e:e2e --args='--project=chromium'
```

The browser suite covers desktop and mobile interactions. The explicit preview
URL matches Tamizhi's local preview port when the E2E app has a different port
in its own environment file.
