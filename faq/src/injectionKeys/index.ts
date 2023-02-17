import * as prismic from '@prismicio/client';
import { InjectionKey } from "vue";

export const GlobalVideoPlayerKey: InjectionKey<(embedHtml: string, originalWidth: number , originalHeight: number) => void> = Symbol('GlobalVideoPlayer');
export const PrismicClientKey: InjectionKey<prismic.Client> = Symbol('PrismicClient');