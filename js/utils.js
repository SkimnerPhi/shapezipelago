import { modImpl } from "./main";

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

/**
 * @param {string} message
 */
export function apUserLog(message) {
    console.log("%c[AP] " + message, "background: #dddddd; color: #0044ff");
}

export function apDebugLog(message) {
    console.log("%c[AP] " + message, "color: #8d07b6");
}

/**
 * @param {boolean} condition
 * @param {string} message
 */
export function apAssert(condition, message) {
    if (!condition) {
        apThrow(message, new Error(message), true);
    }
}

/**
 * @param {string} title
 * @param {() => any} code
 */
export function apTry(title, code) {
    try {
        return code();
    } catch (error) {
        apThrow(title, error, false);
    }
}

/**
 * @param {string} message
 * @param {Error} error
 * @param {boolean} shouldThrowCompletely
 */
function apThrow(message, error, shouldThrowCompletely) {
    const text =
        message +
        "<br />---<br />" +
        error.stack.replaceAll("<", "").replaceAll(">", "").replaceAll("    at ", "<br />- at ");
    if (document.body.getElementsByClassName("gameLoadingOverlay").length) {
        const gameLoadingOverlay = document.body.getElementsByClassName("gameLoadingOverlay").item(0);
        const prefab_GameHint = gameLoadingOverlay.getElementsByClassName("prefab_GameHint").item(0);
        prefab_GameHint.innerHTML =
            "ERROR " + shapez.T.mods.shapezipelago.infoBox.aptry.title + "<br />" + text;
    } else {
        modImpl.dialogs.showInfo(shapez.T.mods.shapezipelago.infoBox.aptry.title, text);
    }
    if (!shouldThrowCompletely) {
        setTimeout(() => {
            throw error;
        });
    } else {
        throw error;
    }
}
