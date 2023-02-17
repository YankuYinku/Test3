import { onMounted, ref, Ref } from 'vue'

/**
 * when given a video container reference, the original dimensions of the video and the HTML embed code
 * this function returns the embed code with altered widt and height values (to fit into the container).
 *
 * @param containerRef The container the video should be filling 100% in width.
 * @param videoWidth Original video width
 * @param videoHeight Original video height
 * @param originalEmbedHTML Prismic embed code, which should be altered.
 * @returns Embed code with new width and height values.
 */
export function useVideoEmbed(
  containerRef: Ref<HTMLElement | undefined>,
  videoWidth: number,
  videoHeight: number,
  originalEmbedHTML: string
): Ref<string> {
  const embedHtml = ref('')

  onMounted(() => {
    const containerWidth = containerRef.value?.offsetWidth
    if (containerWidth && videoWidth && videoHeight && originalEmbedHTML) {
      // how much does the video enlarges / shrinks in width in relation to its container?
      const factor = containerWidth / videoWidth
      const newHeight = videoHeight * factor
      // replace hard coded width and height with calculated values.
      const newIframeHtmlString = originalEmbedHTML
        .replace(/width="\d+"/gi, `width="${containerWidth}px"`)
        .replace(/height="\d+"/gi, `height="${newHeight}px"`)
        .replace(/youtube.com/gi, "youtube-nocookie.com")
      embedHtml.value = newIframeHtmlString
    } else {
      embedHtml.value = originalEmbedHTML
    }
  })

  return embedHtml
}
