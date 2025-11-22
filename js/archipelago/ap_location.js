import { toRoman } from "../utils";

export const enumAchievementToAPLocations = {
    belt500Tiles: "I need trains",
    blueprint100k: "It's piling up",
    blueprint1m: "I'll use it later",
    completeLvl26: "Freedom",
    cutShape: "Cutter",
    destroy1000: "Perfectionist",
    irrelevantShape: "Oops",
    level100: "Is this the end?",
    level50: "Can't stop",
    logoBefore18: "A bit early?",
    mam: "MAM (Make Anything Machine)",
    mapMarkers15: "GPS",
    oldLevel17: "Memories from the past",
    openWires: "The next dimension",
    paintShape: "Painter",
    place5000Wires: "Computer Guy",
    placeBlueprint: "Now it's easy",
    placeBp1000: "Copy-Pasta",
    play1h: "Getting into it",
    produceLogo: "The logo!",
    produceMsLogo: "I've seen that before ...",
    produceRocket: "To the moon",
    rotateShape: "Rotater",
    stack4Layers: "Stack overflow",
    stackShape: "Wait, they stack?",
    store100Unique: "It's a mess",
    storeShape: "Storage",
    throughputBp25: "Efficiency 1",
    throughputBp50: "Efficiency 2",
    throughputLogo25: "Branding specialist 1",
    throughputLogo50: "Branding specialist 2",
    throughputRocket10: "Preparing to launch",
    throughputRocket20: "SpaceY",
    trash1000: "Get rid of them",
    unlockWires: "Wires",
    upgradesTier5: "Faster",
    upgradesTier8: "Even faster",
    darkMode: "My eyes no longer hurt",
    speedrunBp30: "Speedrun Master",
    speedrunBp60: "Speedrun Novice",
    speedrunBp120: "Not an idle game",
    noBeltUpgradesUntilBp: "It's so slow",
    noInverseRotater: "King of Inefficiency",
    play10h: "It's been a long time",
    play20h: "Addicted",
};

export const enumUpgradeIdToAPLocations = {
    belt: "Belt",
    miner: "Miner",
    processors: "Processors",
    painting: "Painting",
};

export function getAPLevelLocationString(level, additional = 0) {
    if (additional === 0) {
        return `Level ${level}`;
    }
    if (additional === 1) {
        return `Level ${level} Additional`;
    }
    return `Level ${level} Additional ${additional}`;
}

export function getAPUpgradeLocationString(upgradeId, level) {
    return `${enumUpgradeIdToAPLocations[upgradeId]} Upgrade Tier ${toRoman(level + 1)}`;
}
