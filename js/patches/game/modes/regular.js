import { RandomNumberGenerator } from "shapez/core/rng";
import {
    categoryRandomUpgradeShapes,
    categoryUpgradeShapes,
    enumVanillaShapes,
    hardcoreUpgradeShapes,
    linearUpgradeShapes,
    randomizedHardcoreDopamineShapes,
    randomizedQuickShapes,
    randomizedRandomStepsShapes,
    randomizedStretchedShapes,
    randomizedVanillaStepsShapes,
    vanillaLikeUpgradeShapes,
    vanillaUpgradeShapes,
} from "../../../requirement_definitions";
import { enumAPLevelLogic, enumAPUpgradeLogic } from "../../../archipelago/ap_settings";
import { apAssert, apDebugLog, apTry } from "../../../utils";
import { connection } from "../../../connection";
import { currentIngame } from "../../../ingame";

export function classPatch({ $old }) {
    return {
        getUpgrades() {
            if (!connection) {
                return $old.getUpgrades();
            }

            apTry("Upgrade definitions failed", () => {
                if (!currentIngame.upgradeDefs) {
                    apDebugLog("Calculating upgrade definitions");
                    currentIngame.upgradeDefs = calcUpgradeDefinitions();
                }
            });
            return currentIngame.upgradeDefs;
        },
        getLevelDefinitions() {
            if (!connection) {
                return $old.getLevelDefinitions();
            }

            apTry("Level definitions failed", () => {
                if (!currentIngame.levelDefs) {
                    apDebugLog("Calculating level definitions");
                    currentIngame.levelDefs = calcLevelDefinitions();
                }
            });
            return currentIngame.levelDefs;
        },
    };
}

/**
 * @returns {{shape: string; required: number; reward: string; throughputOnly: boolean;}[]}
 */
function calcLevelDefinitions() {
    if (!connection.isRandomizedLevels) {
        // @ts-ignore
        return enumVanillaShapes;
    }

    const randomizer = new RandomNumberGenerator(connection.clientSeed);
    switch (connection.levelsLogic) {
        case enumAPLevelLogic.vanilla:
        case enumAPLevelLogic.vanilla_shuffled:
            return randomizedVanillaStepsShapes(randomizer);
        case enumAPLevelLogic.stretched:
        case enumAPLevelLogic.stretched_shuffled:
            return randomizedStretchedShapes(randomizer);
        case enumAPLevelLogic.quick:
        case enumAPLevelLogic.quick_shuffled:
            return randomizedQuickShapes(randomizer);
        case enumAPLevelLogic.random_steps:
        case enumAPLevelLogic.random_steps_shuffled:
            return randomizedRandomStepsShapes(randomizer);
        case enumAPLevelLogic.hardcore:
            return randomizedHardcoreDopamineShapes(randomizer, 5);
        case enumAPLevelLogic.dopamine:
            return randomizedHardcoreDopamineShapes(randomizer, 2);
        case enumAPLevelLogic.dopamine_overflow:
            return randomizedHardcoreDopamineShapes(randomizer, 0);
        default:
            apAssert(false, "Illegal level logic type: " + connection.levelsLogic);
    }
}

function calcUpgradeDefinitions() {
    if (!connection.isRandomizedUpgrades) {
        return vanillaUpgradeShapes();
    }

    const randomizer = new RandomNumberGenerator(connection.clientSeed);
    switch (connection.upgradesLogic) {
        case enumAPUpgradeLogic.vanilla_like:
            return vanillaLikeUpgradeShapes(randomizer);
        case enumAPUpgradeLogic.linear:
            return linearUpgradeShapes(randomizer);
        case enumAPUpgradeLogic.category:
            return categoryUpgradeShapes(randomizer);
        case enumAPUpgradeLogic.category_random:
            return categoryRandomUpgradeShapes(randomizer);
        case enumAPUpgradeLogic.hardcore:
            return hardcoreUpgradeShapes(randomizer);
        default:
            apAssert(false, "Illegal upgrade logic type: " + connection.upgradesLogic);
    }
}
