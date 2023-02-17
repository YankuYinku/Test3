export type SubMenuEntryModel = {
  title: string
  icon: string
  onClick: ((payload: MouseEvent) => void) | undefined
  display: boolean
}
