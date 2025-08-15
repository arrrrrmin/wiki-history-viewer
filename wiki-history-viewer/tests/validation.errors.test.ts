import { assert, expect, suite, test } from 'vitest'

import { parseWikipediaUrl } from '$lib/validation';
import * as errors from "../src/lib/validation.errors";


suite('WikipediaUrlErrors', () => {
    const invalidCases: [string, typeof errors.WikipediaUrlError][] = [
        [
            '',
            errors.WikipediaUrlError
        ],
        [
            'Louvre',
            errors.WikipediaUrlError
        ],
        [
            'https://en.wikipedia.com/wiki/Albert_Einstein',  // Wrong tld
            errors.WrongHostnameError
        ],
        [
            'https://__.wikipedia.org/wiki/Patagonia_(Unternehmen)',  // Unsupported language
            errors.UnsupportedLanguageError
        ],
        [
            'https://wikipedia.org/wiki/Patagonia_(Unternehmen)',  // Missing language
            errors.WrongHostnameError
        ],
        [
            'https://en.wikipedia.org/Albert_Einstein',  // missing /wiki/
            errors.PathnameError
        ]
        // Todo: Update: TitleNotFoundError
    ];

    test.each(invalidCases)('%s throws correctly', (input, expected) => {
        // expect(() => parseWikipediaUrl(input)).toThrowError(expect.objectContaining({
        //     message: 'Pineapples are not in stock',
        // }))
        try {
            parseWikipediaUrl(input)
        } catch (err) {
            assert(err instanceof expected)
        }
    });
})
