import { expect, suite, test } from 'vitest'


import { parseWikipediaUrl } from '../src/lib/validation';
import type { WikimediaUrl } from '../src/lib/validation';


suite('parseWikipediaUrl', () => {
    const validCases: [string, WikimediaUrl][] = [
        [
            'https://en.wikipedia.org/wiki/Albert_Einstein',
            { lang: 'en', title: 'Albert_Einstein' }
        ],
        [
            'https://fr.wikipedia.org/wiki/Louvre',
            { lang: 'fr', title: 'Louvre' }
        ],
        [
            'https://en.m.wikipedia.org/wiki/SpaceX',
            { lang: 'en', title: 'SpaceX' }
        ],
        [
            'https://fr.wikipedia.org/wiki/Louvre?wprov=stfi1',
            { lang: 'fr', title: 'Louvre' }
        ],
        [
            'https://fr.m.wikipedia.org/wiki/Louvre#History',
            { lang: 'fr', title: 'Louvre' }
        ],
        [
            'https://fr.wikipedia.org/wiki/Louvre#History',
            { lang: 'fr', title: 'Louvre' }
        ],
        [
            'https://fr.wikipedia.org/wiki/Louvre?wprov=stfi1#History',
            { lang: 'fr', title: 'Louvre' }
        ],
        [
            'https://de.wikipedia.org/wiki/Café',
            { lang: 'de', title: 'Café' }
        ],
        [
            'https://de.wikipedia.org/wiki/São_Paulo',
            { lang: 'de', title: 'São_Paulo' }
        ]
    ];

    test.each(validCases)('parses %s correctly', (input, expected) => {
        expect(parseWikipediaUrl(input)).toEqual(expected);
    });

})
