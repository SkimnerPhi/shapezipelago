const romanDigits = [
    { key: 1000, val: "M" },
    { key: 900, val: "CM" },
    { key: 500, val: "D" },
    { key: 400, val: "CD" },
    { key: 100, val: "C" },
    { key: 90, val: "XC" },
    { key: 50, val: "L" },
    { key: 40, val: "XL" },
    { key: 10, val: "X" },
    { key: 9, val: "IX" },
    { key: 5, val: "V" },
    { key: 4, val: "IV" },
    { key: 1, val: "I" },
];

/**
 * @param {number} number
 */
export function toRoman(number) {
    let rom = "";
    for (let i = 0; i < romanDigits.length; ++i) {
        while (number >= romanDigits[i].key) {
            rom = rom + romanDigits[i].val;
            number = number - romanDigits[i].key;
        }
    }
    return rom;
}
