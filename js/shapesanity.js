import { enumColorToShortcode } from "shapez/game/colors";
import { enumSubShape, enumSubShapeToShortcode } from "shapez/game/shape_definition";
import { T } from "shapez/translations";
import { enumColors } from "shapez/game/colors";

import { currentIngame } from "./ingame";

const shapesanityStrings = {
    colors: {
        [enumColors.red]: "Red",
        [enumColors.green]: "Green",
        [enumColors.blue]: "Blue",
        [enumColors.yellow]: "Yellow",
        [enumColors.purple]: "Purple",
        [enumColors.cyan]: "Cyan",
        [enumColors.white]: "White",
        [enumColors.uncolored]: "Uncolored",
    },
    shapes: {
        [enumSubShape.rect]: "Square",
        [enumSubShape.circle]: "Circle",
        [enumSubShape.star]: "Star",
        [enumSubShape.windmill]: "Windmill",
    },
    types: {
        piece: "Piece",
        half: "Half",
        cutOut: "Cut Out",
        halfHalf: "Half-Half",
        checkered: "Checkered",
        adjacent: "Adjacent",
        cornered: "Cornered",
        singles: "Singles",
    },
};

const _ = -1;
const shapesanityPatterns = [
    { pattern: [0, 0, 0, 0], callback: pattern0000 },
    ...generatePatternRotations({ pattern: [0, 0, 0, 1], callback: pattern0001 }, 4),
    ...generatePatternRotations({ pattern: [0, 0, 1, 1], callback: pattern0011 }, 2),
    { pattern: [0, 1, 0, 1], callback: pattern0101 },
    ...generatePatternRotations({ pattern: [0, 0, 1, 2], callback: pattern0012 }, 4),
    ...generatePatternRotations({ pattern: [0, 1, 0, 2], callback: pattern0102 }, 2),
    { pattern: [0, 1, 2, 3], callback: pattern0123 },

    ...generatePatternRotations({ pattern: [0, 0, 0, _], callback: pattern000_ }, 4),
    ...generatePatternRotations({ pattern: [0, 1, 0, _], callback: pattern010_ }, 4),
    ...generatePatternRotations({ pattern: [0, 0, 1, _], callback: pattern001_ }, 4),
    ...generatePatternRotations({ pattern: [0, 1, 1, _], callback: pattern011_ }, 4),
    ...generatePatternRotations({ pattern: [0, 1, 2, _], callback: pattern012_ }, 4),

    ...generatePatternRotations({ pattern: [0, 0, _, _], callback: pattern00__ }, 4),
    ...generatePatternRotations({ pattern: [0, 1, _, _], callback: pattern01__ }, 4),

    ...generatePatternRotations({ pattern: [0, _, 0, _], callback: pattern0_0_ }, 2),
    ...generatePatternRotations({ pattern: [0, _, 1, _], callback: pattern0_1_ }, 2),

    ...generatePatternRotations({ pattern: [0, _, _, _], callback: pattern0___ }, 4),
];

function generatePatternRotations(pattern, rotations) {
    const ret = [];
    for (let i = 0; i < rotations; ++i) {
        const next = Object.apply({}, pattern);
        next.pattern = [...pattern.pattern.slice(i), ...pattern.pattern.slice(0, i)];
        next.remap = {};
        let inc = 0;
        for (let j = 0; j < 4; ++j) {
            if (next.pattern[j] === _) {
                continue;
            }
            if (next.remap[next.pattern[j]] === undefined) {
                next.remap[next.pattern[j]] = inc;
                ++inc;
            }
            next.pattern[j] = next.remap[next.pattern[j]];
        }
        ret.push(next);
    }
    return ret;
}

export function toAPLocationShapesanityName(shape) {
    return "Shapesanity " + internal_toShapesanityName(shape, shapesanityStrings);
}
export function toLocalizedShapesanityName(shape) {
    const name = internal_toShapesanityName(shape, {
        colors: T.ingame.colors,
        shapes: T.mods.shapezipelago.shapesanity.shapes,
        types: T.mods.shapezipelago.shapesanity.types,
    });
    return `${T.mods.shapezipelago.shapesanity.title} ${name}`;
}

function internal_toShapesanityName(shape, strings) {
    let patternMap = shapeToPatternMap(shape);
    for (const pattern of shapesanityPatterns) {
        const match = pattern.pattern.every((p, i) => p === patternMap[i]);
        if (!match) {
            continue;
        }

        if (pattern.remap) {
            patternMap = remapPatternMap(patternMap, pattern.remap);
        }

        return pattern.callback(patternMap.map, strings);
    }
}

function shapeToPatternMap(shape) {
    const parts = shape.layers[0];
    const pattern = [];
    const map = [];
    let inc = 0;
    for (let i = 0; i < parts.length; ++i) {
        if (parts[i] === null) {
            pattern[i] = _;
            continue;
        }
        const index = parts.findIndex((p) => equals(p, parts[i]));
        if (index === -1) {
            map.push(parts[i]);
            pattern[i] = inc;
            ++inc;
            continue;
        }
        pattern[i] = index;
    }
    return { pattern, map };
}

function remapPatternMap(patternMap, remap) {
    const pattern = [];
    const map = [];
    for (let i = 0; i < patternMap.pattern.length; ++i) {
        pattern.push(remap[patternMap.pattern[i]]);
    }
    for (let i = 0; i < patternMap.map.length; ++i) {
        map[remap[i]] = patternMap.map[i];
    }
    return { pattern, map };
}

function equals(part1, part2) {
    return part1.subShape === part2.subShape && part1.color === part2.color;
}

function toCornerKey(part) {
    return enumSubShapeToShortcode[part.subShape] + enumColorToShortcode[part.color];
}

function toOrderedCornerKeys(parts) {
    return parts.map(toCornerKey).sort().join(" ");
}

function toOrderedShapesOrColors(parts) {
    if (parts.length === 3) {
        return parts.sort().join("") + "-";
    }
    return parts.sort().join("");
}

function pattern0000(parts, s) {
    return `${s.colors[parts[0].color]} ${s.shapes[parts[0].subShape]}`;
}
function pattern0001(parts, s) {
    return `3-1 ${toCornerKey(parts[0])} ${toCornerKey(parts[1])}`;
}
function pattern0011(parts, s) {
    return `${s.types.halfHalf} ${toOrderedCornerKeys(parts)}`;
}
function pattern0101(parts, s) {
    return `${s.types.checkered} ${toOrderedCornerKeys(parts)}`;
}
function pattern0012(parts, s) {
    return `${s.types.adjacent} 2-1-1 ${toCornerKey(parts[0])} ${toOrderedCornerKeys([parts[1], parts[2]])}`;
}
function pattern0102(parts, s) {
    return `${s.types.cornered} 2-1-1 ${toCornerKey(parts[0])} ${toOrderedCornerKeys([parts[1], parts[2]])}`;
}
function pattern0123(parts, s) {
    let subShapesMatch = true;
    let colorsMatch = true;
    for (let i = 1; i < parts.length; ++i) {
        subShapesMatch &&= parts[i].subShape === parts[0].subShape;
        colorsMatch &&= parts[i].color === parts[0].color;
    }

    if (subShapesMatch) {
        return `${toOrderedShapesOrColors(parts.map((p) => enumColorToShortcode[p.color]))} ${s.shapes[parts[0].subShape]}`;
    }
    if (colorsMatch) {
        return `${s.colors[parts[0].color]} ${toOrderedShapesOrColors(parts.map((p) => enumSubShapeToShortcode[p.subShape]))}`;
    }

    return `${s.types.singles} ${toOrderedCornerKeys(parts)}`;
}
function pattern000_(parts, s) {
    return `${s.types.cutOut} ${s.colors[parts[0].color]} ${s.shapes[parts[0].subShape]}`;
}
function pattern010_(parts, s) {
    return `${s.types.cornered} 2-1 ${toCornerKey(parts[0])} ${toCornerKey(parts[1])}`;
}
function pattern001_(parts, s) {
    return `${s.types.adjacent} 2-1 ${toCornerKey(parts[0])} ${toCornerKey(parts[1])}`;
}
function pattern011_(parts, s) {
    return `${s.types.cornered} 2-1 ${toCornerKey(parts[1])} ${toCornerKey(parts[0])}`;
}
function pattern012_(parts, s) {
    let subShapesMatch = true;
    let colorsMatch = true;
    for (let i = 1; i < parts.length; ++i) {
        subShapesMatch &&= parts[i].subShape === parts[0].subShape;
        colorsMatch &&= parts[i].color === parts[0].color;
    }

    if (subShapesMatch) {
        return `${toOrderedShapesOrColors(parts.map((p) => enumColorToShortcode[p.color]))} ${s.shapes[parts[0].subShape]}`;
    }
    if (colorsMatch) {
        return `${s.colors[parts[0].color]} ${toOrderedShapesOrColors(parts.map((p) => enumSubShapeToShortcode[p.subShape]))}`;
    }

    return `${s.types.singles} ${toOrderedCornerKeys(parts)}`;
}
function pattern00__(parts, s) {
    return `${s.types.half} ${s.colors[parts[0].color]} ${s.shapes[parts[0].subShape]}`;
}
function pattern01__(parts, s) {
    return `${s.types.adjacent} ${s.types.singles} ${toOrderedCornerKeys(parts)}`;
}
function pattern0_0_(parts, s) {
    return `${s.types.cornered} ${s.colors[parts[0].color]} ${s.shapes[parts[0].subShape]}`;
}
function pattern0_1_(parts, s) {
    return `${s.types.cornered} ${s.types.singles} ${toOrderedCornerKeys(parts)}`;
}
function pattern0___(parts, s) {
    return `${s.colors[parts[0].color]} ${s.shapes[parts[0].subShape]} ${s.types.piece}`;
}

export const capitalColorNames = {
    Uncolored: "u",
    Red: "r",
    Green: "g",
    Blue: "b",
    Yellow: "y",
    Cyan: "c",
    Purple: "p",
    White: "w",
};
export const capitalShapeNames = {
    Circle: "C",
    Square: "R",
    Star: "S",
    Windmill: "W",
};

/**
 * @param {string} name
 */
export function translateShapesanity(name) {
    if (currentIngame.translated[name]) {
        return currentIngame.translated[name];
    }
    const words = name.split(" ");
    if (words.length === 2) {
        // simple full, 1-4
        if (capitalColorNames[words[0]]) {
            if (capitalShapeNames[words[1]]) {
                const ret = T.mods.shapezipelago.shapesanityBox.byNoun[words[0]][words[1]].replace(
                    "<shape>",
                    T.mods.shapezipelago.shapesanityBox.shape[words[1]]
                );
                currentIngame.translated[name] = ret.charAt(0).toUpperCase() + ret.slice(1);
            } else {
                currentIngame.translated[name] = T.mods.shapezipelago.shapesanityBox["1Color4Shapes"][
                    words[0]
                ].replace("<code>", words[1]);
            }
        } else {
            currentIngame.translated[name] = T.mods.shapezipelago.shapesanityBox["4Colors1Shape"][
                words[1]
            ].replace("<code>", words[0]);
        }
    } else if (words.length === 3) {
        // half, piece, cornered simple, 3-1, half-half, checkered
        if (words[0] === "Half") {
            currentIngame.translated[name] = T.mods.shapezipelago.shapesanityBox.byNoun.Half[
                words[2]
            ].replace(
                "<comb>",
                T.mods.shapezipelago.shapesanityBox.byNoun[words[1]][words[2]].replace(
                    "<shape>",
                    T.mods.shapezipelago.shapesanityBox.shape[words[2]]
                )
            );
        } else if (words[2] === "Piece") {
            const ret = T.mods.shapezipelago.shapesanityBox.Piece[words[1]].replace(
                "<comb>",
                T.mods.shapezipelago.shapesanityBox.byNoun[words[0]].Piece.replace(
                    "<shape>",
                    T.mods.shapezipelago.shapesanityBox.shape[words[1]]
                )
            );
            currentIngame.translated[name] = ret.charAt(0).toUpperCase() + ret.slice(1);
        } else if (words[0] === "Cornered") {
            currentIngame.translated[name] = T.mods.shapezipelago.shapesanityBox.byNoun.Cornered[
                words[2]
            ].replace(
                "<comb>",
                T.mods.shapezipelago.shapesanityBox.byNoun[words[1]][words[2]].replace(
                    "<shape>",
                    T.mods.shapezipelago.shapesanityBox.shape[words[2]]
                )
            );
        } else if (words[0] === "3-1") {
            currentIngame.translated[name] = T.mods.shapezipelago.shapesanityBox.shortKeys[
                "3-1"
            ].replace("<codes>", `${words[1]} ${words[2]}`);
        } else if (words[0] === "Half-Half") {
            currentIngame.translated[name] = T.mods.shapezipelago.shapesanityBox.shortKeys[
                "Half-Half"
            ].replace("<codes>", `${words[1]} ${words[2]}`);
        } else {
            // if (words[0] === "Checkered")
            currentIngame.translated[name] = T.mods.shapezipelago.shapesanityBox.shortKeys[
                "Checkered"
            ].replace("<codes>", `${words[1]} ${words[2]}`);
        }
    } else if (words.length === 4) {
        // Cut Out, 2-sided singles and 2-1, 3-part singles
        if (words[0] === "Cut") {
            currentIngame.translated[name] = T.mods.shapezipelago.shapesanityBox.byNoun.CutOut[
                words[3]
            ].replace(
                "<comb>",
                T.mods.shapezipelago.shapesanityBox.byNoun[words[2]][words[3]].replace(
                    "<shape>",
                    T.mods.shapezipelago.shapesanityBox.shape[words[3]]
                )
            );
        } else if (words[0] === "Singles") {
            currentIngame.translated[name] = T.mods.shapezipelago.shapesanityBox.shortKeys[
                "Singles"
            ].replace("<codes>", `${words[1]} ${words[2]} ${words[3]}`);
        } else {
            // 2-sided singles and 2-1
            currentIngame.translated[name] = T.mods.shapezipelago.shapesanityBox.shortKeys[
                words[0] + words[1]
            ].replace("<codes>", `${words[2]} ${words[3]}`);
        }
    } else {
        // (words.length == 5): 3-part 2-1-1, 4-part
        if (words[0] === "Singles") {
            currentIngame.translated[name] = T.mods.shapezipelago.shapesanityBox.shortKeys[
                "Singles"
            ].replace("<codes>", `${words[1]} ${words[2]} ${words[3]} ${words[4]}`);
        } else {
            // 3-part 2-1-1
            currentIngame.translated[name] = T.mods.shapezipelago.shapesanityBox.shortKeys[
                words[0] + words[1]
            ].replace("<codes>", `${words[2]} ${words[3]} ${words[4]}`);
        }
    }
    return currentIngame.translated[name];
}
const oneWordLen3 = {
    "Half": (words) => {
        const code = capitalShapeNames[words[2]] + capitalColorNames[words[1]];
        return "----" + code + code;
    },
    "Cornered": words => {
        const code = capitalShapeNames[words[2]] + capitalColorNames[words[1]];
        return "--" + code + "--" + code;
    },
    "3-1": (words) => {
        return words[2] + words[1] + words[1] + words[1];
    },
    "Half-Half": (words) => {
        return words[2] + words[2] + words[1] + words[1];
    },
    "Checkered": (words) => {
        return words[2] + words[1] + words[2] + words[1];
    },
};
const twoWordLen4 = {
    "AdjacentSingles": (words) => {
        return "--" + words[3] + words[2] + "--";
    },
    "Adjacent2-1": (words) => {
        return "--" + words[3] + words[2] + words[2];
    },
    "CorneredSingles": (words) => {
        return words[3] + "--" + words[2] + "--";
    },
    "Cornered2-1": (words) => {
        return words[2] + words[3] + words[2] + "--";
    },
};

/**
 * @param {String} name
 */
export function shapesanityExample(name) {
    const words = name.split(" ");
    if (capitalColorNames[words[0]]) {
        if (capitalShapeNames[words[1]]) {
            if (words[2] === "Piece") {
                return capitalShapeNames[words[1]] + capitalColorNames[words[0]] + "------";
            } else {
                const code = capitalShapeNames[words[1]] + capitalColorNames[words[0]];
                return code + code + code + code;
            }
        } else {
            const col = capitalColorNames[words[0]];
            let ret = "";
            for (let i = 0; i < 4; ++i) {
                if (words[1].charAt(i) === "-") {
                    ret = ret + "--";
                } else {
                    ret = ret + words[1].charAt(i) + col;
                }
            }
            return ret;
        }
    } else if (words[0] === "Singles") {
        if (words.length === 4) {
            return "--" + words[1] + words[2] + words[3];
        }
        if (words.length === 5) {
            return words[1] + words[2] + words[3] + words[4];
        }
    } else if (words.length === 3) {
        return oneWordLen3[words[0]](words);
    } else if (words.length === 4) {
        if (words[0] === "Cut" && words[1] === "Out") {
            const code = capitalShapeNames[words[3]] + capitalColorNames[words[2]];
            return "--" + code + code + code;
        }
        return twoWordLen4[words[0] + words[1]](words);
    } else if (words.length === 5 && words[1] === "2-1-1") {
        if (words[0] === "Cornered") {
            return words[2] + words[3] + words[2] + words[4];
        }
        if (words[0] === "Adjacent") {
            return words[2] + words[3] + words[4] + words[2];
        }
    } else {
        const shap = capitalShapeNames[words[1]];
        let ret = "";
        for (let i = 0; i < 4; ++i) {
            if (words[0].charAt(i) === "-") {
                ret = ret + "--";
            } else {
                ret = ret + shap + words[0].charAt(i);
            }
        }
        return ret;
    }
    return "";
}
