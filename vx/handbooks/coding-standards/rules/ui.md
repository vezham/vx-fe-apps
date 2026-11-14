# UI Rules

## Vezham UI Context

This workspace uses `@vezham/react-v3` for base components and
`@vezham/react-pro-v3` for Pro components. The reference below is intentionally
kept local so agents can choose the right primitive while offline. Update it
when either dependency changes.

```tsx
import { Command, ContextMenu } from '@vezham/react-pro-v3'
import { Button, Card, Input, Sheet, TextField } from '@vezham/react-v3'
```

Use the Vezham root imports for base and Pro components.

## Mandatory Rules

1. Never add a UI provider solely for base component styling.
2. Never import from legacy v2 component packages.
3. Never use a Tailwind v3 JavaScript configuration. Vezham UI uses Tailwind
   CSS v4 with CSS-based configuration.
4. Use documented compound anatomy as the Vx default: `Card.Header` instead of
   the flat `CardHeader` import. Use the normal component export when it has no
   compound parts.
5. Always use `onPress` on Vezham UI and React Aria pressable components; use the
   documented event API for native elements and other libraries.
6. Always give icon-only controls an accessible name and provide required labels
   for composite components such as `Table.Content`.

`@vx-lint/accessibility-labels` enforces an `aria-label` or `aria-labelledby`
attribute for Vezham UI `Button isIconOnly` and `Table.Content`. JSX accessibility
rules also validate applicable native elements. Spreads and custom wrappers need
review because a static check cannot inspect their runtime props.

## Component Selection

The compound-component convention also applies to custom Vx components and
future implementations when they expose a compound API. The
`@vx-lint/dot-notation` rule detects supported import/export patterns without
registration; see [Code Review](../review.md) for examples and limits.
Independent components do not require compound wrappers solely for naming.

- Before creating application UI, check the installed Vezham UI packages for the
  required primitive. Prefer an available component; use native elements for
  semantic structure and gaps in both component libraries.
- Treat the installed component documentation and type declarations as the source
  of truth. When the Pro component MCP is available, list components before
  choosing one and read its documentation before implementing unfamiliar anatomy
  or props.
- Do not copy component APIs from prompts, examples, or older library versions.
  They are reference material and may be stale.
- Use `@vezham/react-v3` for base components and `@vezham/react-pro-v3` for Pro
  components. Do not introduce legacy v2 or upstream base-package imports into
  application code.

## Styling and Accessibility

- Use Tailwind CSS v4 utilities and Vezham semantic tokens such as
  `bg-background`, `text-muted`, and `border-border`; do not use legacy v2
  numbered color tokens.
- Use BEM naming for authored reusable CSS selectors, with the component or
  feature namespace as the block (for example, `.vx-not-found__image`). Keep
  one-off layout and token styling in Tailwind utilities.
- Give icon-only controls an accessible name. Provide required accessible labels
  for composite components such as tables, menus, and navigation.
- Use semantic HTML for document structure and accessible native behaviour where
  no component primitive applies.
- Do not recreate an accessible Vezham UI primitive with custom markup unless the
  documented component cannot meet the requirement.
- Prefer component states and semantic variants over custom state styling.

## Component Reference

Use this list to identify the appropriate component before writing custom UI.
For props, slots, variants, and uncommon compositions, inspect the installed
type declarations or current component documentation.

### Base Components

| Need                     | Components                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Actions                  | `Button`, `ButtonGroup`, `CloseButton`, `ToggleButton`, `ToggleButtonGroup`, `Toolbar`                                |
| Form fields              | `TextField`, `Input`, `TextArea`, `SearchField`, `NumberField`, `InputOtp`, `Autocomplete`, `ComboBox`, `Select`      |
| Selection                | `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `SwitchGroup`, `Tag`, `TagGroup`                        |
| Date and time            | `DateField`, `DatePicker`, `DateRangePicker`, `TimeField`, `Calendar`, `RangeCalendar`                                |
| Feedback                 | `Alert`, `AlertDialog`, `ErrorMessage`, `FieldError`, `ProgressBar`, `ProgressCircle`, `Skeleton`, `Spinner`, `Toast` |
| Display                  | `Avatar`, `Badge`, `Card`, `Chip`, `EmptyState`, `Kbd`, `Meter`, `Surface`, `Typography`                              |
| Navigation               | `Accordion`, `Breadcrumbs`, `Link`, `Pagination`, `Tabs`                                                              |
| Overlays and collections | `Drawer`, `Modal`, `Sheet`, `Popover`, `Tooltip`, `Dropdown`, `Menu`, `ListBox`, `Table`                              |
| Structure and utilities  | `Description`, `Fieldset`, `Form`, `Header`, `Label`, `ScrollShadow`, `Separator`                                     |

### Pro Components

| Need                   | Components                                                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application navigation | `AppLayout`, `Command`, `ContextMenu`, `Navbar`, `Segment`, `Sidebar`, `Stepper`                                                                                           |
| Data display           | `ActionBar`, `Agenda`, `DataGrid`, `FileTree`, `FloatingToc`, `ItemCard`, `ItemCardGroup`, `Kanban`, `KPIGroup`, `ListView`, `Timeline`, `Widget`                          |
| Overlays and input     | `HoverCard`, `EmojiPicker`, `DropZone`, `InlineSelect`, `NativeSelect`, `RadioButtonGroup`                                                                                 |
| Feedback and metrics   | `EmojiReactionButton`, `NumberValue`, `PressableFeedback`, `Rating`, `TextShimmer`, `TrendChip`                                                                            |
| AI surfaces            | `ChainOfThought`, `ChatAttachment`, `ChatConversation`, `ChatListView`, `ChatLoader`, `ChatMessage`, `ChatMessageActions`, `ChatSource`, `PromptInput`, `PromptSuggestion` |

## Common Anatomy

```tsx
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Supporting context</Card.Description>
  </Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Footer>
    <Button onPress={save}>Save</Button>
  </Card.Footer>
</Card>
```

```tsx
<TextField>
  <Label>Email</Label>
  <Input type="email" />
  <Description>Used for account messages.</Description>
  <FieldError />
</TextField>
```

```tsx
<Switch>
  <Switch.Content>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    Enable notifications
  </Switch.Content>
</Switch>
```
