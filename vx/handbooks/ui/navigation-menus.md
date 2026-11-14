# Navigation menus

Below 640px, the application menu uses a HeroUI bottom Sheet. On larger
screens it retains its Dropdown and nested popovers. This presentation is owned
by the React package; apps keep their `vx.nav.yaml` menu configuration and action
handlers.

The small-screen application sheet keeps Search, Bookmarks, and Storage together
before the separator. Menu groups open as local detail panels with a Back action;
selecting an action closes the sheet and calls the existing app-menu handler.
Sidebar visibility and command-palette actions retain their existing behavior.

The bottom navigation More control opens a Sheet containing the overflow
navigation destinations as full-width stacked rows. Its visible title is hidden
with `MenuSheet`’s optional `hideTitle` prop; `title` still supplies the accessible
dialog name. The Application menu also opts into `hideTitle`. Other callers
keep their title visible by default. Labels wrap within each
row, and only the sheet body scrolls when the destinations exceed the available
height. Selecting a destination closes the sheet and follows
its existing navigation handler. Resizing retains the previous close behavior.

Both menus use the shared internal `MenuSheet` component, with a drag handle,
close button, bounded scrolling, safe-area padding, and focus restoration. Only
the handle can drag the sheet, so menu interactions remain usable. The overlay
renders above the bottom navigation. The account/footer More menu remains a
Dropdown; its Control Center entry opens the separate Control Center sheet.

Tamizhi AI uses a bottom Sheet whenever the account/More bubble is shown (below
768px). The footer and info panel share the same responsive query.
Expand fills the viewport, and Collapse restores the sheet size without losing
messages or the composer draft. Above that breakpoint it uses the inline info panel without
an Expand control. Storage and Bookmarks follow the same account-bubble breakpoint:
side panels from 768px upward and bottom Sheets below 768px. Their Sheets open at 75%
of the viewport height, with Expand and Collapse preserving the current content.
Their own content scrolls while the Sheet header stays visible.
The Sheets preserve the page's full width while mobile navigation bubbles and
the bottom bar are visible.

The review UI uses HeroUI Pro ChatConversation, ChatMessage, ChatMessageActions,
ChatAttachment, PromptInput, PromptSuggestion, ChatLoader, TextShimmer, and
ChainOfThought. It includes a welcome state, sample prompts, attachment previews,
streamed mock replies, expandable preview progress, copying, feedback, and
regeneration. Stop and closing the assistant cancel pending replies.

In the desktop AI panel, sub-navigation and the composer stay fixed within the
panel; only the conversation scrolls. Short conversations align above the
composer and grow upward; long conversations keep their chronological order
and scroll to the latest message until the user scrolls back. Sending a new
prompt returns to the latest messages. The jump button overlays the viewport
outside its scrolling content. Branch chat copies the conversation through the
selected reply into a separate thread; continuing it leaves the original intact.
The footer warns that agent outputs need verification and links the Tamizhi
logo and name to `https://tamizhi.vezham.com/`. The chat-title dropdown reopens recent
threads, and New chat starts an empty thread. Changing threads cancels pending
responses. Chats and drafts are held
in memory for the current assistant session.

The mock follows the four groups in the
[HeroUI agent component guide](https://heroui.pro/docs/agents/components):
sample metrics and a table, information cards, a preferences form, and action
buttons. These are representative previews, not the entire hosted GenUI catalog.
The composer model picker supports recommended Auto routing or a manual model
from the reference catalog. Turning Auto off restores the last manual choice.
Below 640px, model feature cards are omitted. From 640px upward, hover or focus
shows a card to the side with the model description, illustrative ratings for
complex tasks, generated UI, speed and cost, and sample context information.
These ratings are mock UI data, not provider specifications. The independent
lightning control toggles Fast mode on or off. Provider marks are embedded
locally from Lobe Icons with their license; both model rows and the selected
model control show them. The GPT section contains GPT-6.1 Sol and GPT-6 Astra,
the two newest entries in this mock catalog. Permission options include their
reference descriptions and a check for the selected mode. Model, Fast mode, and
tool-permission selectors change preview state only. Files stay local
as metadata; voice uses a sample transcript without microphone access. No model,
hosted agent, upload service, or workspace tool is connected.

The account menu follows the application menu breakpoint: below 640px it uses
a content-sized Sheet with local detail lists and a Back action; larger screens
use Dropdown submenus for availability, custom status, and duration. In account
bubble view the Dropdown opens below the avatar and aligns to its trailing edge;
in desktop sidebar view it opens beside the avatar. Status choices show the
current selection, and clearing custom status also clears its duration.

Info panels use `Surface variant="transparent"`, matching the menu layout,
and share layout, header, heading, and body spacing between side and Sheet
presentations. HeroUI owns surface styling; the Sheet keeps its native dialog
treatment. Only the outer frame owns borders, corners, and safe-area padding. Storage uses semantic theme tokens for muted text and
separators; its row action buttons keep transparent hover backgrounds.
