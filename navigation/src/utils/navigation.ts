// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { navigateToUrl } from 'single-spa'

export function navigateTo(url: string): void {
  navigateToUrl(url)
}
