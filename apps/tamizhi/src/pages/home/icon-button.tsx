import type { ComponentProps } from 'react'

import { Button, Tooltip } from '@vezham/react-v3'

type Props = Omit<ComponentProps<typeof Button>, 'aria-label'> & {
  label: string
}

export const IconButton = ({ label, children, ...props }: Props) => (
  <Tooltip delay={500}>
    <Button isIconOnly variant="ghost" aria-label={label} {...props}>
      {children}
    </Button>
    <Tooltip.Content>{label}</Tooltip.Content>
  </Tooltip>
)
