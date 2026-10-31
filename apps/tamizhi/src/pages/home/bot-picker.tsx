import { useState } from 'react'

import { Add, AltArrowDown } from '@vezham/icons-react'
import {
  Button,
  Dropdown,
  Form,
  Input,
  Label,
  Modal,
  TextField
} from '@vezham/react-v3'

import { OUTFITS, detectOutfit } from './avatar-data'
import type { Outfit } from './avatar-data'

interface Bot {
  id: string
  name: string
  job: string
  outfit: Outfit
}
interface Props {
  name: string
  outfit: Outfit
  onSelect: (name: string, outfit: Outfit) => void
}

export const BotPicker = ({ name, outfit, onSelect }: Props) => {
  const [bots, setBots] = useState<Bot[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [job, setJob] = useState('')
  const draftOutfit = detectOutfit(job)
  const createBot = () => {
    if (!draftName.trim()) return
    const bot = {
      id: crypto.randomUUID(),
      name: draftName.trim(),
      job: job.trim(),
      outfit: draftOutfit
    }
    setBots(current => [...current, bot])
    onSelect(bot.name, bot.outfit)
    setIsOpen(false)
    setDraftName('')
    setJob('')
  }
  return (
    <>
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
              {bots.map(bot => (
                <Dropdown.Item
                  key={bot.id}
                  id={bot.id}
                  textValue={bot.name}
                  onAction={() => onSelect(bot.name, bot.outfit)}>
                  {bot.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </h1>
      <Button
        variant="ghost"
        className="tamizhi-welcome__new-bot"
        onPress={() => setIsOpen(true)}>
        <Add size={15} aria-hidden="true" />
        New bot
      </Button>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        className="tamizhi-overlay">
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>New bot</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={event => {
                  event.preventDefault()
                  createBot()
                }}
                className="gap-4">
                <TextField value={draftName} onChange={setDraftName} isRequired>
                  <Label>Name</Label>
                  <Input maxLength={24} placeholder="Name" />
                </TextField>
                <TextField value={job} onChange={setJob}>
                  <Label>What it helps with</Label>
                  <Input maxLength={60} placeholder="Recipes, code, writing…" />
                </TextField>
                <p className="text-muted text-sm">
                  Outfit: {OUTFITS.find(item => item.id === draftOutfit)?.label}
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onPress={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isDisabled={!draftName.trim()}>
                    Create bot
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  )
}
