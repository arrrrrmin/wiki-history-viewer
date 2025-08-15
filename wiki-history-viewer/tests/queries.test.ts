import { expect, suite, test } from 'vitest'


suite('encodeURIComponent', () => {
    const validCases: [string, string][] = [
        ["Heidi Reichineck", "Heidi%20Reichineck"]
    ]
    test.each(validCases)('%s encodes correctly', (input, expected) => {
        expect(encodeURIComponent(input)).toEqual(expected);
    });
});
