export function usePrioritizedLanguageCode(languageCodes: string[]): string {
    let languageCode = 'de-DE'

    if (languageCodes && languageCodes.length === 1) {
        // send language code of the single selected customer number OR just de_DE as default
        return languageCodes[0] ?? languageCode
    }

    // if multiple language codes are passed, return the prioritized one
    if (languageCodes.includes('de-DE')) {
        languageCode = 'de-DE'
    } else if (languageCodes.includes('de-AT')) {
        languageCode = 'de-AT'
    } else if (languageCodes.includes('nl-NL')) {
        languageCode = 'nl-NL'
    }

    return languageCode
}