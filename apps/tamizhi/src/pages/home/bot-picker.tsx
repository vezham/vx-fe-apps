import { AltArrowDown } from '@vezham/icons-react'
import { Dropdown } from '@vezham/react-v3'

import { OUTFITS, detectOutfit } from './avatar-data'
import type { Outfit } from './avatar-data'

interface Props {
  name: string
  outfit: Outfit
  onSelect: (name: string, outfit: Outfit) => void
}

export const BotPicker = ({ name, outfit, onSelect }: Props) => (
  <h1 id="welcome-title" className="tamizhi-welcome__question">
    Who’s helping?
    <Dropdown>
      <Dropdown.Trigger
        className="tamizhi-welcome__bot"
        aria-label="Choose a bot">
        {name}
        <AltArrowDown size={22} aria-hidden="true" />
      </Dropdown.Trigger>
      <Dropdown.Popover className="tamizhi-bots">
        <Dropdown.Menu
          aria-label="Bots"
          selectionMode="single"
          selectedKeys={[outfit]}>
          {OUTFITS.map(item => (
            <Dropdown.Item
              key={item.id}
              id={item.id}
              textValue={item.name}
              onAction={() => onSelect(item.name, item.id)}>
              {item.name}
              <Dropdown.ItemIndicator />
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  </h1>
)
