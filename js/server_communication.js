import { ShapeDefinition } from "shapez/game/shape_definition";
import {
    baseBuildingNames,
    connection,
    currentIngame,
    enumTrapToHubGoalRewards,
    modImpl,
} from "./global_data";
import { CLIENT_STATUS } from "archipelago.js";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { GameRoot } from "shapez/game/root";
import { RandomNumberGenerator } from "shapez/core/rng";
import { apDebugLog, apTry } from "./utils";
import { getAPUpgradeLocationString } from "./archipelago/ap_location";
import { toAPLocationShapesanityName } from "./shapesanity";

/**
 * @type {{[x:string]: (root: GameRoot, resynced: Boolean, index: number) => String}}
 */
export const receiveItemFunctions = {
    "Progressive Extractor": (root, resynced, index) => {
        if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_extractor]) {
            root.hubGoals.gainedRewards[enumHubGoalRewards.reward_miner_chainable] = 1;
        } else {
            root.hubGoals.gainedRewards[enumHubGoalRewards.reward_extractor] = 1;
        }
        return "";
    },
    "Progressive Cutter": (root, resynced, index) => {
        if (connection.unlockVariant === "backwards") {
            if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_cutter_quad]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_cutter] = 1;
            } else {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_cutter_quad] = 1;
            }
        } else {
            if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_cutter]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_cutter_quad] = 1;
            } else {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_cutter] = 1;
            }
        }
        return "";
    },
    "Progressive Rotator": (root, resynced, index) => {
        if (connection.unlockVariant === "backwards") {
            if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_rotater_ccw]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_rotater] = 1;
            } else if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_rotater_180]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_rotater_ccw] = 1;
            } else {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_rotater_180] = 1;
            }
        } else {
            if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_rotater_ccw]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_rotater_180] = 1;
            } else if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_rotater]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_rotater_ccw] = 1;
            } else {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_rotater] = 1;
            }
        }
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_belt] = 1;
        return "";
    },
    "Progressive Painter": (root, resynced, index) => {
        if (connection.unlockVariant === "backwards") {
            if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_painter_double]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_painter] = 1;
            } else if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_painter_quad]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_painter_double] = 1;
            } else {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_painter_quad] = 1;
            }
        } else {
            if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_painter_double]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_painter_quad] = 1;
            } else if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_painter]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_painter_double] = 1;
            } else {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_painter] = 1;
            }
        }
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_belt] = 1;
        return "";
    },
    "Progressive Tunnel": (root, resynced, index) => {
        if (connection.unlockVariant === "backwards") {
            if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_underground_belt_tier_2]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_tunnel] = 1;
            } else {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_underground_belt_tier_2] = 1;
            }
        } else {
            if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_tunnel]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_underground_belt_tier_2] = 1;
            } else {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_tunnel] = 1;
            }
        }
        return "";
    },
    "Progressive Balancer": (root, resynced, index) => {
        if (connection.unlockVariant === "backwards") {
            if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_merger]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_balancer] = 1;
            } else if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_splitter]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_merger] = 1;
            } else {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_splitter] = 1;
            }
        } else {
            if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_merger]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_splitter] = 1;
            } else if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_balancer]) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_merger] = 1;
            } else {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_balancer] = 1;
            }
        }
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_belt] = 1;
        return "";
    },
    "Belt": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_belt] = 1;
        return "";
    },
    "Extractor": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_extractor] = 1;
        return "";
    },
    "Cutter": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_cutter] = 1;
        return "";
    },
    "Rotator": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_rotater] = 1;
        return "";
    },
    "Painter": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_painter] = 1;
        return "";
    },
    "Rotator (CCW)": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_rotater_ccw] = 1;
        return "";
    },
    "Color Mixer": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_mixer] = 1;
        return "";
    },
    "Stacker": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_stacker] = 1;
        return "";
    },
    "Quad Cutter": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_cutter_quad] = 1;
        return "";
    },
    "Double Painter": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_painter_double] = 1;
        return "";
    },
    "Rotator (180°)": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_rotater_180] = 1;
        return "";
    },
    "Quad Painter": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_painter_quad] = 1;
        return "";
    },
    "Balancer": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_balancer] = 1;
        return "";
    },
    "Tunnel": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_tunnel] = 1;
        return "";
    },
    "Compact Merger": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_merger] = 1;
        return "";
    },
    "Tunnel Tier II": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_underground_belt_tier_2] = 1;
        return "";
    },
    "Compact Splitter": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_splitter] = 1;
        return "";
    },
    "Trash": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_trash] = 1;
        return "";
    },
    "Chaining Extractor": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_miner_chainable] = 1;
        return "";
    },
    "Belt Reader": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_belt_reader] = 1;
        return "";
    },
    "Storage": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_storage] = 1;
        return "";
    },
    "Switch": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_lever] = 1;
        return "";
    },
    "Item Filter": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_filter] = 1;
        return "";
    },
    "Display": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_display] = 1;
        return "";
    },
    "Wires": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_wires] = 1;
        return "";
    },
    "Constant Signal": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_constant_signal] = 1;
        return "";
    },
    "Logic Gates": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_logic_gates] = 1;
        return "";
    },
    "Virtual Processing": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_virtual_processing] = 1;
        return "";
    },
    "Blueprints": (root, resynced, index) => {
        root.hubGoals.gainedRewards[enumHubGoalRewards.reward_blueprints] = 1;
        return "";
    },
    "Big Belt Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["belt"] += 1;
        return "";
    },
    "Big Miner Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["miner"] += 1;
        return "";
    },
    "Big Processors Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["processors"] += 1;
        return "";
    },
    "Big Painting Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["painting"] += 1;
        return "";
    },
    "Small Belt Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["belt"] += 0.1;
        return "";
    },
    "Small Miner Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["miner"] += 0.1;
        return "";
    },
    "Small Processors Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["processors"] += 0.1;
        return "";
    },
    "Small Painting Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["painting"] += 0.1;
        return "";
    },
    "Blueprint Shapes Bundle": (root, resynced, index) => {
        if (resynced) {
            return "";
        }
        root.hubGoals.storedShapes[connection.blueprintShape] =
            (root.hubGoals.storedShapes[connection.blueprintShape] || 0) + 1000;
        shapesanityAnalyzer(ShapeDefinition.fromShortKey(connection.blueprintShape));
        return ": 1000";
    },
    "Level Shapes Bundle": (root, resynced, index) => {
        if (resynced) {
            return "";
        }
        /**
         * @type {{[x: string]: number}}
         */
        const upgrades = {};
        for (const category in currentIngame.upgradeDefs) {
            for (const tier of currentIngame.upgradeDefs[category]) {
                for (const next of tier.required) {
                    const remaining = next.amount - (root.hubGoals.storedShapes[next.shape] || 0);

                    // If this shape wasn't written down yet, just use the calculated remaining
                    // If it was already written down, only update remaining if it's less than before
                    if (upgrades[next.shape] !== null) {
                        upgrades[next.shape] = Math.min(upgrades[next.shape], remaining);
                    } else {
                        upgrades[next.shape] = remaining;
                    }
                }
            }
        }
        for (const level of currentIngame.levelDefs) {
            if (!level.throughputOnly) {
                const remaining = level.required - (root.hubGoals.storedShapes[level.shape] || 0);

                // If this shape wasn't written down yet, just use the calculated remaining
                // If it was already written down, only update remaining if it's less than before
                if (upgrades[level.shape] !== null) {
                    upgrades[level.shape] = Math.min(upgrades[level.shape], remaining);
                } else {
                    upgrades[level.shape] = remaining;
                }
            }
        }
        for (
            let levelIndex = root.hubGoals.level - 1;
            levelIndex < currentIngame.levelDefs.length;
            ++levelIndex
        ) {
            const definition = currentIngame.levelDefs[levelIndex];
            let addedAmount;
            if (upgrades[definition.shape] > 1) {
                // Non-ool amount to give
                addedAmount = Math.floor(upgrades[definition.shape] / 2);
            } else if (upgrades[definition.shape] === 1) {
                // addedAmount would be 0, so let's look for another level
                continue;
            } else {
                // upgrades[definition.shape] == null or < 1
                // This level is throughput and no upgrade requires its shape, or shape is producible
                addedAmount = 1000;
            }
            root.hubGoals.storedShapes[definition.shape] =
                (root.hubGoals.storedShapes[definition.shape] || 0) + addedAmount;
            shapesanityAnalyzer(ShapeDefinition.fromShortKey(definition.shape));
            return `: ${addedAmount} ${definition.shape}`;
        }
        // In case of the current level being in freeplay
        freeplay: if (root.hubGoals.isFreePlay()) {
            const definition = root.hubGoals.currentGoal;
            const hash = definition.definition.getHash();
            let addedAmount;
            if (upgrades[hash] > 1) {
                // Non-ool amount to give
                addedAmount = Math.floor(upgrades[hash] / 2);
            } else if (upgrades[hash] === 1) {
                // addedAmount would be 0, so let's look for another level
                break freeplay;
            } else {
                // upgrades[definition.shape] == null or < 1
                // This level is throughput, and no upgrade requires its shape or shape is producible
                addedAmount = 1000;
            }
            root.hubGoals.storedShapes[hash] = (root.hubGoals.storedShapes[hash] || 0) + addedAmount;
            shapesanityAnalyzer(ShapeDefinition.fromShortKey(hash));
            return `: ${addedAmount} ${hash}`;
        }
        // If loop found nothing, then addedAmount can only be 0, so no shapes
        return ": None";
    },
    "Upgrade Shapes Bundle": (root, resynced, index) => {
        // TODO
        // Resyncing should never do something to hubGoals.storedShapes
        if (resynced) {
            return "";
        }
        // Write all remaining for every upgrade down
        // All shapes in current tiers can get the bundle
        /**
         * @type {{[x: string]: number}}
         */
        const remainingDict = {};
        /**
         * @type {string[]}
         */
        const addableShapes = [];
        for (const category in currentIngame.upgradeDefs) {
            for (const tier of currentIngame.upgradeDefs[category]) {
                for (const next of tier.required) {
                    const remaining = next.amount - (root.hubGoals.storedShapes[next.shape] || 0);
                    remainingDict[next.shape] =
                        remainingDict[next.shape] === null
                            ? // If this shape wasn't written down yet, just use the calculated remaining
                              // If it was already written down, only update remaining if it's less than before
                              remaining
                            : Math.min(remainingDict[next.shape], remaining);
                }
            }
            const upgradeLevel = root.hubGoals.getUpgradeLevel(category);
            if (upgradeLevel < currentIngame.upgradeDefs[category].length) {
                const tier = currentIngame.upgradeDefs[category][upgradeLevel];
                for (const next of tier.required) {
                    addableShapes.push(next.shape);
                }
            }
        }
        for (const level of currentIngame.levelDefs) {
            if (!level.throughputOnly) {
                if (!(remainingDict[level.shape] === null)) {
                    remainingDict[level.shape] = Math.min(
                        remainingDict[level.shape],
                        level.required - (root.hubGoals.storedShapes[level.shape] || 0)
                    );
                }
            }
        }
        for (const addable of addableShapes.slice()) {
            if (remainingDict[addable] === 1) {
                addableShapes.splice(addableShapes.indexOf(addable), 1);
            }
        }
        // If loop found nothing, then addedAmount can only be 0, so no shapes
        if (addableShapes.length === 0) {
            return ": None";
        }
        const randomShape = addableShapes[Math.floor(Math.random() * addableShapes.length)];
        let addedAmount;
        if (remainingDict[randomShape] > 1) {
            addedAmount = Math.floor(remainingDict[randomShape] / 2);
        } else {
            addedAmount = 1000;
        }
        root.hubGoals.storedShapes[randomShape] =
            (root.hubGoals.storedShapes[randomShape] || 0) + addedAmount;
        shapesanityAnalyzer(ShapeDefinition.fromShortKey(randomShape));
        return `: ${addedAmount} ${randomShape}`;
    },
    "Inventory Draining Trap": (root, resynced, index) => {
        if (resynced) {
            return "";
        }
        const r = Math.random() * 3;
        if (r < 1) {
            return (
                receiveItemFunctions["Blueprint Shapes Draining Trap"](root, resynced, index) +
                " " +
                shapez.T.mods.shapezipelago.itemReceivingBox.extraInfo.versionBlueprint
            );
        } else if (r < 2) {
            return receiveItemFunctions["Level Shapes Draining Trap"](root, resynced, index);
        } else {
            return receiveItemFunctions["Upgrade Shapes Draining Trap"](root, resynced, index);
        }
    },
    "Blueprint Shapes Draining Trap": (root, resynced, index) => {
        if (resynced) {
            return "";
        }
        const storedBlueprint = root.hubGoals.storedShapes[connection.blueprintShape] || 0;
        const drained = Math.floor(storedBlueprint / Math.log10(storedBlueprint + 1000) - 2);
        root.hubGoals.storedShapes[connection.blueprintShape] = storedBlueprint - drained;
        return `: ${drained}`;
    },
    "Level Shapes Draining Trap": (root, resynced, index) => {
        if (resynced) {
            return "";
        }
        for (
            let levelIndex = root.hubGoals.level - 1;
            levelIndex < currentIngame.levelDefs.length;
            ++levelIndex
        ) {
            const currentLevel = currentIngame.levelDefs[levelIndex];
            const stored = root.hubGoals.storedShapes[currentLevel.shape] || 0;
            if (!currentLevel.throughputOnly && stored) {
                const drained = Math.ceil(stored / 2);
                root.hubGoals.storedShapes[currentLevel.shape] = stored - drained;
                return `: ${drained} ${currentLevel.shape}`;
            }
        }
        for (
            let levelIndex = root.hubGoals.level - 1;
            levelIndex < currentIngame.levelDefs.length;
            ++levelIndex
        ) {
            const currentLevel = currentIngame.levelDefs[levelIndex];
            const stored = root.hubGoals.storedShapes[currentLevel.shape] || 0;
            if (stored) {
                const drained = Math.ceil(stored / 2);
                root.hubGoals.storedShapes[currentLevel.shape] -= drained;
                return `: -${drained} ${currentLevel.shape}`;
            }
        }
        if (root.hubGoals.currentGoal.throughputOnly) {
            const currentLevel = root.hubGoals.currentGoal;
            const stored = root.hubGoals.storedShapes[currentLevel.definition.getHash()] || 0;
            if (stored) {
                const drained = Math.ceil(stored / 2);
                root.hubGoals.storedShapes[currentLevel.definition.getHash()] -= drained;
                return `: -${drained} ${currentLevel.definition.getHash()}`;
            }
        }
        return ": None";
    },
    "Upgrade Shapes Draining Trap": (root, resynced, index) => {
        if (resynced) {
            return "";
        }
        /**
         * @type {string[]}
         */
        const drainable = [];
        for (const category in currentIngame.upgradeDefs) {
            const upgradeLevel = root.hubGoals.getUpgradeLevel(category);
            if (upgradeLevel < currentIngame.upgradeDefs[category].length) {
                const tier = currentIngame.upgradeDefs[category][upgradeLevel];
                for (const next of tier.required) {
                    if (root.hubGoals.storedShapes[next.shape]) {
                        drainable.push(next.shape);
                    }
                }
            }
        }
        if (drainable.length === 0) {
            for (const category in currentIngame.upgradeDefs) {
                for (const tier of currentIngame.upgradeDefs[category]) {
                    for (const next of tier.required) {
                        if (root.hubGoals.storedShapes[next.shape]) {
                            drainable.push(next.shape);
                        }
                    }
                }
            }
        }
        if (drainable.length) {
            const randomShape = drainable[Math.floor(Math.random() * drainable.length)];
            const drained = Math.ceil(root.hubGoals.storedShapes[randomShape] / 2);
            root.hubGoals.storedShapes[randomShape] -= drained;
            return `: -${drained} ${randomShape}`;
        } else {
            return ": None";
        }
    },
    "Locked Building Trap": (root, resynced, index) => {
        if (resynced) {
            return "";
        }
        /**
         * @type {string[]}
         */
        const lockable = [];
        for (const trap in currentIngame.trapLocked) {
            if (root.hubGoals.isRewardUnlocked(enumTrapToHubGoalRewards[trap])) {
                lockable.push(trap);
            }
        }
        if (lockable.length === 0) {
            return ": None";
        }
        const randomBuilding = lockable[Math.floor(Math.random() * lockable.length)];
        const randomTimeSec = Math.floor(Math.random() * 46) + 15;
        currentIngame.trapLocked[randomBuilding] = true;
        setTimeout(() => {
            currentIngame.trapLocked[randomBuilding] = false;
        }, randomTimeSec * 1000);
        return `: ${
            shapez.T.mods.shapezipelago.itemReceivingBox.item[baseBuildingNames[randomBuilding]]
        } ${shapez.T.mods.shapezipelago.itemReceivingBox.extraInfo.time.replace("<x>", randomTimeSec)}`;
    },
    "Throttled Building Trap": (root, resynced, index) => {
        if (resynced) {
            return "";
        }
        /**
         * @type {string[]}
         */
        const throttlable = [];
        for (const trap in currentIngame.trapThrottled) {
            if (
                root.hubGoals.isRewardUnlocked(enumTrapToHubGoalRewards[trap]) &&
                !currentIngame.trapThrottled[trap]
            ) {
                throttlable.push(trap);
            }
        }
        if (throttlable.length === 0) {
            return ": None";
        }
        const randomBuilding = throttlable[Math.floor(Math.random() * throttlable.length)];
        const randomTimeSec = Math.floor(Math.random() * 46) + 15;
        currentIngame.trapThrottled[randomBuilding] = true;
        setTimeout(() => {
            currentIngame.trapThrottled[randomBuilding] = false;
        }, randomTimeSec * 1000);
        return `: ${
            shapez.T.mods.shapezipelago.itemReceivingBox.item[baseBuildingNames[randomBuilding]]
        } ${shapez.T.mods.shapezipelago.itemReceivingBox.extraInfo.time.replace("<x>", randomTimeSec)}`;
    },
    "Malfunctioning Trap": (root, resynced, index) => {
        if (resynced) {
            return "";
        }
        /**
         * @type {string[]}
         */
        const malfunctionable = [];
        for (const trap in currentIngame.trapMalfunction) {
            if (
                root.hubGoals.isRewardUnlocked(enumTrapToHubGoalRewards[trap]) &&
                !currentIngame.trapMalfunction[trap]
            ) {
                malfunctionable.push(trap);
            }
        }
        if (malfunctionable.length === 0) {
            return ": None";
        }
        const randomBuilding = malfunctionable[Math.floor(Math.random() * malfunctionable.length)];
        const randomTimeSec = Math.floor(Math.random() * 46) + 15;
        currentIngame.trapMalfunction[randomBuilding] = true;
        setTimeout(() => {
            currentIngame.trapMalfunction[randomBuilding] = false;
        }, randomTimeSec * 1000);
        return `: ${
            shapez.T.mods.shapezipelago.itemReceivingBox.item[baseBuildingNames[randomBuilding]]
        } ${shapez.T.mods.shapezipelago.itemReceivingBox.extraInfo.time.replace("<x>", randomTimeSec)}`;
    },
    "Gigantic Belt Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["belt"] += 10;
        return "";
    },
    "Gigantic Miner Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["miner"] += 10;
        return "";
    },
    "Gigantic Processors Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["processors"] += 10;
        return "";
    },
    "Gigantic Painting Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["painting"] += 10;
        return "";
    },
    "Rising Belt Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["belt"] *= 2;
        return "";
    },
    "Rising Miner Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["miner"] *= 2;
        return "";
    },
    "Rising Processors Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["processors"] *= 2;
        return "";
    },
    "Rising Painting Upgrade": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["painting"] *= 2;
        return "";
    },
    "Belt Upgrade Trap": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["belt"] -= 3;
        if (root.hubGoals.upgradeImprovements["belt"] < 0.5) {
            root.hubGoals.upgradeImprovements["belt"] = 0.5;
        }
        return "";
    },
    "Miner Upgrade Trap": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["miner"] -= 3;
        if (root.hubGoals.upgradeImprovements["miner"] < 0.5) {
            root.hubGoals.upgradeImprovements["miner"] = 0.5;
        }
        return "";
    },
    "Processors Upgrade Trap": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["processors"] -= 3;
        if (root.hubGoals.upgradeImprovements["processors"] < 0.5) {
            root.hubGoals.upgradeImprovements["processors"] = 0.5;
        }
        return "";
    },
    "Painting Upgrade Trap": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["painting"] -= 3;
        if (root.hubGoals.upgradeImprovements["painting"] < 0.5) {
            root.hubGoals.upgradeImprovements["painting"] = 0.5;
        }
        return "";
    },
    "Demonic Belt Upgrade Trap": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["belt"] *= 0.5;
        if (root.hubGoals.upgradeImprovements["belt"] < 0.5) {
            root.hubGoals.upgradeImprovements["belt"] = 0.5;
        }
        return "";
    },
    "Demonic Miner Upgrade Trap": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["miner"] *= 0.5;
        if (root.hubGoals.upgradeImprovements["miner"] < 0.5) {
            root.hubGoals.upgradeImprovements["miner"] = 0.5;
        }
        return "";
    },
    "Demonic Processors Upgrade Trap": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["processors"] *= 0.5;
        if (root.hubGoals.upgradeImprovements["processors"] < 0.5) {
            root.hubGoals.upgradeImprovements["processors"] = 0.5;
        }
        return "";
    },
    "Demonic Painting Upgrade Trap": (root, resynced, index) => {
        root.hubGoals.upgradeImprovements["painting"] *= 0.5;
        if (root.hubGoals.upgradeImprovements["painting"] < 0.5) {
            root.hubGoals.upgradeImprovements["painting"] = 0.5;
        }
        return "";
    },
    "Big Random Upgrade": (root, resynced, index) => {
        const category = new RandomNumberGenerator(connection.clientSeed + index).choice([
            "belt",
            "miner",
            "processors",
            "painting",
        ]);
        root.hubGoals.upgradeImprovements[category] += 2;
        return `: ${shapez.T.mods.shapezipelago.itemReceivingBox.extraInfo.upgradeId[category]}`;
    },
    "Small Random Upgrade": (root, resynced, index) => {
        const category = new RandomNumberGenerator(connection.clientSeed + index).choice([
            "belt",
            "miner",
            "processors",
            "painting",
        ]);
        root.hubGoals.upgradeImprovements[category] += 0.2;
        return `: ${shapez.T.mods.shapezipelago.itemReceivingBox.extraInfo.upgradeId[category]}`;
    },
    "Inflation Trap": (root, resynced, index) => {
        ++connection.requiredShapesMultiplier;
        currentIngame.levelDefs = null;
        currentIngame.upgradeDefs = null;
        currentIngame.amountByLevelCache = null;
        root.gameMode.getLevelDefinitions();
        root.gameMode.getUpgrades();
        root.hubGoals.computeNextGoal();
        root.hud.parts["pinnedShapes"].rerenderFull();
        root.buffers.cache.delete("hub");
        root.hud.update();
        return "";
    },
    "Belts Clearing Trap": (root, resynced, index) => {
        if (resynced) {
            return "";
        }
        root.logic.clearAllBeltsAndItems();
        return "";
    },
};

/**
 * @param {string[]} names
 * @param {string} resyncMessage
 * @param {boolean} goal
 */
export function checkLocation(resyncMessage, goal, ...names) {
    bulkCheckLocation(resyncMessage, goal, names);
}

/**
 * @param {string[]} names
 * @param {string} resyncMessage
 * @param {boolean} goal
 */
export function bulkCheckLocation(resyncMessage, goal, names) {
    apTry("Checking location failed", () => {
        apDebugLog(`Checking ${names.length} locations (goal==${goal}): ${names.toString()}`);
        if (goal) {
            connection.reportStatusToServer(CLIENT_STATUS.GOAL);
        }
        const locids = [];
        const namesCopy = names.slice();
        for (const name of namesCopy) {
            if (name.startsWith("Shapesanity")) {
                names.push(
                    "Shapesanity " +
                        (connection.shapesanityNames.indexOf(name.substring("Shapesanity ".length)) + 1)
                );
                names.splice(names.indexOf(name), 1); // Get rid of pre-0.5.0 shapesanity location names
            }
        }
        for (const name of names) {
            const nextId = connection.gamepackage.location_name_to_id[name];
            if (nextId !== null && connection.client.locations.missing.includes(nextId)) {
                locids.push(nextId);
                apDebugLog(`${resyncMessage} location ${name} with ID ${nextId}`);
            }
        }
        connection.sendLocationChecks(locids);
    });
}

// This isn't an ideal location for this function, but it's the best option for now
export function resyncLocationChecks() {
    apDebugLog("Resyncing already reached locations");
    const toResync = [];
    // resync levels
    for (let i = 1; i < currentIngame.root.hubGoals.level; ++i) {
        // current level is what is to be completed
        toResync.push(`Level ${i}`);
    }
    if (currentIngame.root.hubGoals.level > 20) {
        toResync.push("Level 20 Additional", "Level 20 Additional 2");
    }
    if (currentIngame.root.hubGoals.level > 1) {
        toResync.push("Level 1 Additional");
    }
    // resync upgrades
    for (const upgradeId of ["belt", "miner", "processors", "painting"]) {
        const currentLevel = currentIngame.root.hubGoals.getUpgradeLevel(upgradeId);
        for (let i = 1; i <= currentLevel; ++i) {
            toResync.push(getAPUpgradeLocationString(upgradeId, i));
        }
    }
    // Send resync packet
    bulkCheckLocation("Resynced", false, toResync);
    // resync shapesanity
    for (const [hash, amount] of Object.entries(currentIngame.root.hubGoals.storedShapes)) {
        if ((amount || 0) > 0) {
            shapesanityAnalyzer(ShapeDefinition.fromShortKey(hash));
        }
    }
    // resync goals
    if (connection.goal === "vanilla" || connection.goal === "mam") {
        if (connection.levelsToGenerate < currentIngame.root.hubGoals.level) {
            checkLocation("Checked", true);
        }
    } else if (connection.goal === "even_fasterer") {
        // upgrade levels start at 0, because it is used for index of upgrade definitions
        if (
            currentIngame.root.hubGoals.getUpgradeLevel("belt") + 1 >= connection.tiersToGenerate &&
            currentIngame.root.hubGoals.getUpgradeLevel("miner") + 1 >= connection.tiersToGenerate &&
            currentIngame.root.hubGoals.getUpgradeLevel("processors") + 1 >= connection.tiersToGenerate &&
            currentIngame.root.hubGoals.getUpgradeLevel("painting") + 1 >= connection.tiersToGenerate
        ) {
            checkLocation("Checked", true);
        }
    }
}

/**
 * @param {import("archipelago.js").ReceivedItemsPacket} packet
 */
export function processItemsPacket(packet) {
    apDebugLog(
        "Received packet with " +
            packet.items.length +
            " items and reported index " +
            packet.index +
            ", while having " +
            currentIngame.processedItemCount +
            " items"
    );
    // Prevent errors in main menu
    if (!currentIngame) {
        return;
    }
    const all_items = connection.client.items.received;
    // Resync already received items at first packet
    if (!currentIngame.isItemsResynced) {
        currentIngame.isItemsResynced = true;
        // Resetting gained rewards to 0 (mostly used like a boolean)
        for (const reward in currentIngame.root.hubGoals.gainedRewards) {
            currentIngame.root.hubGoals.gainedRewards[reward] = 0;
        }
        // Resetting upgrade improvements to 1 (it's a multiplier)
        for (const id in currentIngame.root.hubGoals.upgradeImprovements) {
            currentIngame.root.hubGoals.upgradeImprovements[id] = 1;
        }
        // Re-receive items without popup
        const cachedprocessedItemCount = currentIngame.processedItemCount;
        for (let i = 0; i < cachedprocessedItemCount; ++i) {
            receiveItem(all_items[i], false, true, i);
        }
        // Backwards compatibility to 0.5.3
        const datacache = connection.client.data.slotData["lock_belt_and_extractor"];
        if (datacache !== null) {
            apDebugLog(`Loaded lock_belt_and_extractor as backwards compatibility: ${datacache}`);
            if (!datacache) {
                currentIngame.root.hubGoals.gainedRewards[enumHubGoalRewards.reward_belt] = 1;
                currentIngame.root.hubGoals.gainedRewards[enumHubGoalRewards.reward_extractor] = 1;
            }
        } else {
            apDebugLog("No lock_belt_and_extractor found in slotData");
        }
    }
    if (currentIngame.processedItemCount === all_items.length) {
        apDebugLog("Items up-to-date");
    } else if (currentIngame.processedItemCount === all_items.length - 1) {
        receiveItem(
            all_items[currentIngame.processedItemCount],
            true,
            false,
            currentIngame.processedItemCount
        );
        ++currentIngame.processedItemCount;
    } else if (currentIngame.processedItemCount === all_items.length - 2) {
        receiveItem(
            all_items[currentIngame.processedItemCount],
            true,
            false,
            currentIngame.processedItemCount
        );
        ++currentIngame.processedItemCount;
        receiveItem(
            all_items[currentIngame.processedItemCount],
            true,
            false,
            currentIngame.processedItemCount
        );
        ++currentIngame.processedItemCount;
    } else if (currentIngame.processedItemCount === all_items.length - 3) {
        receiveItem(
            all_items[currentIngame.processedItemCount],
            true,
            false,
            currentIngame.processedItemCount
        );
        ++currentIngame.processedItemCount;
        receiveItem(
            all_items[currentIngame.processedItemCount],
            true,
            false,
            currentIngame.processedItemCount
        );
        ++currentIngame.processedItemCount;
        receiveItem(
            all_items[currentIngame.processedItemCount],
            true,
            false,
            currentIngame.processedItemCount
        );
        ++currentIngame.processedItemCount;
    } else {
        const itemCounting = [];
        for (let i = currentIngame.processedItemCount; i < all_items.length; ++i) {
            itemCounting.push(receiveItem(all_items[i], false, false, i));
            ++currentIngame.processedItemCount;
        }
        modImpl.dialogs.showInfo(
            shapez.T.mods.shapezipelago.itemReceivingBox.title.multiple,
            itemCounting.join("<br />")
        );
    }
    currentIngame.itemReceiveSignal.dispatch();
}

/**
 * @param {import("archipelago.js").NetworkItem} item
 * @param {boolean} showInfo
 * @param {boolean} resynced
 * @param {number} index
 */
function receiveItem(item, showInfo, resynced, index) {
    const itemName = connection.getItemName(item.item);
    let message = ": [ERROR]";
    apTry("Item receiving failed", () => {
        message = receiveItemFunctions[itemName](currentIngame.root, resynced, index);
    });
    apDebugLog("Processed item " + itemName + message);
    if (showInfo) {
        const sendingPlayerName = connection.getPlayername(item.player);
        const foundLocationName = connection.getLocationName(item.player, item.location);
        modImpl.dialogs.showInfo(
            shapez.T.mods.shapezipelago.itemReceivingBox.title.single,
            shapez.T.mods.shapezipelago.itemReceivingBox.item[itemName] +
                message +
                "<br />" +
                shapez.T.mods.shapezipelago.itemReceivingBox.foundBy
                    .replace("<player>", sendingPlayerName)
                    .replace("<location>", foundLocationName)
        );
        return "";
    } else {
        return shapez.T.mods.shapezipelago.itemReceivingBox.item[itemName] + message;
    }
}

/**
 * @param {ShapeDefinition} shape
 */
export function shapesanityAnalyzer(shape) {
    apTry("Analyzing shapesanity failed", () => {
        if (shape.layers.length !== 1) {
            return;
        }
        if (connection.shapesanityCache[shape.getHash()]) {
            return;
        }

        const shapesanity = toAPLocationShapesanityName();
        checkLocation("Checked", false, shapesanity);
        connection.shapesanityCache[shape.getHash()] = true;
    });
}
