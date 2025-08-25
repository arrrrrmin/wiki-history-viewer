import { expect, suite, test } from 'vitest'

import { IdHandler } from '../src/lib/d3js/utils';


suite('settingIds', () => {
    const chartId = 'superChart'
    const handler = new IdHandler(chartId);

    const validCases: [string?, string?][] = [
        [
            handler.register("rect", "series"), `${chartId}-rect-series`
        ],
        [
            handler.register("path", "new"), `${chartId}-path-new`
        ],
        // Insert the same id
        [
            handler.register("path", "new"), `${chartId}-path-new`
        ],
        [
            handler.find("path", "new"), `${chartId}-path-new`
        ],
        [
            handler.selector("path", "new"), `path#${chartId}-path-new`
        ],
        // Selected but not registered (auto register expected)
        [
            handler.selector("path", "fresh"), `path#${chartId}-path-fresh`
        ],
    ];

    test.each(validCases)('produced %s correctly', (input, expected) => {
        expect(input).toEqual(expected);
    });
})
