import { ShapeDefinition } from "shapez/game/shape_definition";
import { CLIENT_STATUS } from "archipelago.js";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { GameRoot } from "shapez/game/root";
import { RandomNumberGenerator } from "shapez/core/rng";
import { getAPUpgradeLocationString } from "./archipelago/ap_location";
import { toAPLocationShapesanityName } from "./shapesanity";
import { enumAPItems } from "./archipelago/ap_items";
import { clamp } from "shapez/core/utils";
import { T } from "shapez/translations";
import { connection } from "./connection";
import { currentIngame } from "./ingame";
import { logger, modImpl } from "./main";
import { enumTrapTypes } from "./archipelago/ap_traps";

const rng = new RandomNumberGenerator();

export const baseBuildingNames = {
    belt: "Belt",
    balancer: "Balancer",
    tunnel: "Tunnel",
    extractor: "Extractor",
    cutter: "Cutter",
    cutter_quad: "Quad Cutter",
    rotator: "Rotator",
    rotator_ccw: "Rotator (CCW)",
    rotator_180: "Rotator (180°)",
    stacker: "Stacker",
    painter: "Painter",
    painter_quad: "Quad Painter",
    mixer: "Color Mixer",
    trash: "Trash",
};

/**
 * @type {{[x:string]: (root: GameRoot, resynced: Boolean, index: number) => String}}
 */
export const receiveItemFunctions = {
    [enumAPItems.progressive_extractor]: (root) => {
        if (root.hubGoals.gainedRewards[enumHubGoalRewards.reward_extractor]) {
            root.hubGoals.gainedRewards[enumHubGoalRewards.reward_miner_chainable] = 1;
        } else {
            root.hubGoals.gainedRewards[enumHubGoalRewards.reward_extractor] = 1;
        }
        return "";
    },
    [enumAPItems.progressive_cutter]: func_progressiveUnlockReward([
        enumHubGoalRewards.reward_cutter,
        enumHubGoalRewards.reward_cutter_quad,
    ]),
    [enumAPItems.progressive_rotator]: func_progressiveUnlockReward([
        enumHubGoalRewards.reward_rotater,
        enumHubGoalRewards.reward_rotater_ccw,
        enumHubGoalRewards.reward_rotater_180,
    ]),
    [enumAPItems.progressive_painter]: func_progressiveUnlockReward([
        enumHubGoalRewards.reward_painter,
        enumHubGoalRewards.reward_painter_double,
        enumHubGoalRewards.reward_painter_quad,
    ]),
    [enumAPItems.progressive_tunnel]: func_progressiveUnlockReward([
        enumHubGoalRewards.reward_tunnel,
        enumHubGoalRewards.reward_underground_belt_tier_2,
    ]),
    [enumAPItems.progressive_balancer]: func_progressiveUnlockReward([
        enumHubGoalRewards.reward_balancer,
        enumHubGoalRewards.reward_merger,
        enumHubGoalRewards.reward_splitter,
    ]),
    [enumAPItems.belt]: func_unlockReward(enumHubGoalRewards.reward_belt),
    [enumAPItems.extractor]: func_unlockReward(enumHubGoalRewards.reward_miner),
    [enumAPItems.extractor_chainable]: func_unlockReward(enumHubGoalRewards.reward_miner_chainable),
    [enumAPItems.cutter]: func_unlockReward(enumHubGoalRewards.reward_cutter),
    [enumAPItems.cutter_quad]: func_unlockReward(enumHubGoalRewards.reward_cutter_quad),
    [enumAPItems.rotator]: func_unlockReward(enumHubGoalRewards.reward_rotater),
    [enumAPItems.rotator_ccw]: func_unlockReward(enumHubGoalRewards.reward_rotater_ccw),
    [enumAPItems.rotator_180]: func_unlockReward(enumHubGoalRewards.reward_rotater_180),
    [enumAPItems.painter]: func_unlockReward(enumHubGoalRewards.reward_painter),
    [enumAPItems.painter_double]: func_unlockReward(enumHubGoalRewards.reward_painter_double),
    [enumAPItems.painter_quad]: func_unlockReward(enumHubGoalRewards.reward_painter_quad),
    [enumAPItems.mixer]: func_unlockReward(enumHubGoalRewards.reward_mixer),
    [enumAPItems.stacker]: func_unlockReward(enumHubGoalRewards.reward_stacker),
    [enumAPItems.balancer]: func_unlockReward(enumHubGoalRewards.reward_balancer),
    [enumAPItems.balancer_merger]: func_unlockReward(enumHubGoalRewards.reward_merger),
    [enumAPItems.balancer_splitter]: func_unlockReward(enumHubGoalRewards.reward_splitter),
    [enumAPItems.tunnel]: func_unlockReward(enumHubGoalRewards.reward_tunnel),
    [enumAPItems.tunnel_tier_2]: func_unlockReward(enumHubGoalRewards.reward_underground_belt_tier_2),
    [enumAPItems.trash]: func_unlockReward(enumHubGoalRewards.reward_trash),
    [enumAPItems.reader]: func_unlockReward(enumHubGoalRewards.reward_belt_reader),
    [enumAPItems.storage]: func_unlockReward(enumHubGoalRewards.reward_storage),
    [enumAPItems.lever]: func_unlockReward(enumHubGoalRewards.reward_lever),
    [enumAPItems.filter]: func_unlockReward(enumHubGoalRewards.reward_filter),
    [enumAPItems.display]: func_unlockReward(enumHubGoalRewards.reward_display),
    [enumAPItems.wires]: func_unlockReward(enumHubGoalRewards.reward_wires),
    [enumAPItems.constant_signal]: func_unlockReward(enumHubGoalRewards.reward_constant_signal),
    [enumAPItems.logic_gate]: func_unlockReward(enumHubGoalRewards.reward_logic_gates),
    [enumAPItems.virtual_processor]: func_unlockReward(enumHubGoalRewards.reward_virtual_processing),
    [enumAPItems.blueprints]: func_unlockReward(enumHubGoalRewards.reward_blueprints),
    [enumAPItems.upgrade_small_random]: func_randomItem([
        enumAPItems.upgrade_small_belt,
        enumAPItems.upgrade_small_miner,
        enumAPItems.upgrade_small_processors,
        enumAPItems.upgrade_small_painting,
    ]),
    [enumAPItems.upgrade_small_belt]: func_upgradeAdditive("belt", 0.1),
    [enumAPItems.upgrade_small_miner]: func_upgradeAdditive("miner", 0.1),
    [enumAPItems.upgrade_small_processors]: func_upgradeAdditive("processors", 0.1),
    [enumAPItems.upgrade_small_painting]: func_upgradeAdditive("painting", 0.1),
    [enumAPItems.upgrade_big_random]: func_randomItem([
        enumAPItems.upgrade_big_belt,
        enumAPItems.upgrade_big_miner,
        enumAPItems.upgrade_big_processors,
        enumAPItems.upgrade_big_painting,
    ]),
    [enumAPItems.upgrade_big_belt]: func_upgradeAdditive("belt", 1),
    [enumAPItems.upgrade_big_miner]: func_upgradeAdditive("miner", 1),
    [enumAPItems.upgrade_big_processors]: func_upgradeAdditive("processors", 1),
    [enumAPItems.upgrade_big_painting]: func_upgradeAdditive("painting", 1),
    [enumAPItems.upgrade_gigantic_belt]: func_upgradeAdditive("belt", 10),
    [enumAPItems.upgrade_gigantic_miner]: func_upgradeAdditive("miner", 10),
    [enumAPItems.upgrade_gigantic_processors]: func_upgradeAdditive("processors", 10),
    [enumAPItems.upgrade_gigantic_painting]: func_upgradeAdditive("painting", 10),
    [enumAPItems.upgrade_rising_belt]: func_upgradeMultiplicative("belt", 2),
    [enumAPItems.upgrade_rising_miner]: func_upgradeMultiplicative("miner", 2),
    [enumAPItems.upgrade_rising_processors]: func_upgradeMultiplicative("processors", 2),
    [enumAPItems.upgrade_rising_painting]: func_upgradeMultiplicative("painting", 2),
    [enumAPItems.trap_upgrade_normal_belt]: func_upgradeAdditive("belt", -3),
    [enumAPItems.trap_upgrade_normal_miner]: func_upgradeAdditive("miner", -3),
    [enumAPItems.trap_upgrade_normal_processors]: func_upgradeAdditive("processors", -3),
    [enumAPItems.trap_upgrade_normal_painting]: func_upgradeAdditive("painting", -3),
    [enumAPItems.trap_upgrade_demonic_belt]: func_upgradeMultiplicative("belt", 0.5),
    [enumAPItems.trap_upgrade_demonic_miner]: func_upgradeMultiplicative("miner", 0.5),
    [enumAPItems.trap_upgrade_demonic_processors]: func_upgradeMultiplicative("processors", 0.5),
    [enumAPItems.trap_upgrade_demonic_painting]: func_upgradeMultiplicative("painting", 0.5),
    [enumAPItems.bundle_shapes_blueprint]: (root, resynced) => {
        if (resynced) {
            return "";
        }

        const value = (root.hubGoals.storedShapes[connection.blueprintShape] ?? 0) + 1000;
        root.hubGoals.storedShapes[connection.blueprintShape] = value;

        return ": 1000";
    },
    [enumAPItems.bundle_shapes_level]: (root, resynced) => {
        if (resynced) {
            return "";
        }

        const upgrades = {};
        for (const category in currentIngame.upgradeDefs) {
            for (const tier of currentIngame.upgradeDefs[category]) {
                for (const next of tier.required) {
                    const remaining = next.amount - (root.hubGoals.storedShapes[next.shape] ?? 0);
                    if (upgrades[next.shape]) {
                        upgrades[next.shape] = Math.min(upgrades[next.shape], remaining);
                    } else {
                        upgrades[next.shape] = remaining;
                    }
                }
            }
        }

        for (const level of currentIngame.levelDefs) {
            if (level.throughputOnly) {
                continue;
            }

            const remaining = level.required - (root.hubGoals.storedShapes[level.shape] ?? 0);
            if (upgrades[level.shape]) {
                upgrades[level.shape] = Math.min(upgrades[level.shape], remaining);
            } else {
                upgrades[level.shape] = remaining;
            }
        }

        for (let i = root.hubGoals.level - 1; i < currentIngame.levelDefs.length; ++i) {
            const definition = currentIngame.levelDefs[i];
            if (upgrades[definition.shape] === 1) {
                continue;
            }

            return addShapesToStorage(root, upgrades, definition.shape, 1000);
        }

        if (!root.hubGoals.isFreePlay()) {
            return ": None";
        }

        const definition = root.hubGoals.currentGoal;
        const hash = definition.definition.getHash();
        if (upgrades[hash] === 1) {
            return ": None";
        }

        return addShapesToStorage(root, upgrades, hash, 1000);
    },
    [enumAPItems.bundle_shapes_upgrade]: (root, resynced) => {
        if (resynced) {
            return "";
        }

        const remaining = {};
        const addable = [];
        for (const category in currentIngame.upgradeDefs) {
            for (const tier of currentIngame.upgradeDefs[category]) {
                for (const next of tier.required) {
                    const value = next.amount - (root.hubGoals.storedShapes[next.shape] ?? 0);
                    if (remaining[next.shape]) {
                        remaining[next.shape] = Math.min(remaining[next.shape], value);
                    } else {
                        remaining[next.shape] = value;
                    }
                }
            }

            const upgradeLevel = root.hubGoals.getUpgradeLevel(category);
            if (upgradeLevel < currentIngame.upgradeDefs[category].length) {
                const tier = currentIngame.upgradeDefs[category][upgradeLevel];
                for (const next of tier.required) {
                    addable.push(next.shape);
                }
            }
        }

        const filteredAddable = addable.filter((x) => remaining[x] !== 1);
        if (filteredAddable.length === 0) {
            return ": None";
        }

        const randomShape = rng.choice(addable);

        return addShapesToStorage(root, remaining, randomShape, 1000);
    },
    [enumAPItems.trap_drain_shapes_random]: func_randomItem([
        enumAPItems.trap_drain_shapes_blueprint,
        enumAPItems.trap_drain_shapes_level,
        enumAPItems.trap_drain_shapes_upgrade,
    ]),
    [enumAPItems.trap_drain_shapes_blueprint]: (root, resynced) => {
        if (resynced) {
            return "";
        }

        const value = root.hubGoals.storedShapes[connection.blueprintShape] ?? 0;
        const delta = Math.floor(value / Math.log10(value + 1000) - 2);
        root.hubGoals.storedShapes[connection.blueprintShape] = value - delta;
        return `: -${delta}`;
    },
    [enumAPItems.trap_drain_shapes_level]: (root, resynced) => {
        if (resynced) {
            return "";
        }

        let targetShape, targetValue;
        let fallbackShape, fallbackValue;
        for (let i = root.hubGoals.level - 1; i < currentIngame.levelDefs.length; ++i) {
            const currentLevel = currentIngame.levelDefs[i];
            const value = root.hubGoals.storedShapes[currentLevel.shape];
            if (!value) {
                continue;
            }
            if (currentLevel.throughputOnly && !fallbackShape) {
                fallbackShape = currentLevel.shape;
                fallbackValue = value;
                continue;
            }
            targetShape = currentLevel.shape;
            targetValue = value;
            break;
        }

        const shape = targetShape ?? fallbackShape;
        const value = targetValue ?? fallbackValue;

        if (!value) {
            return ": None";
        }

        const delta = Math.ceil(value / 2);
        root.hubGoals.storedShapes[shape] = value - delta;
        return `: -${delta} ${shape}`;
    },
    [enumAPItems.trap_drain_shapes_upgrade]: (root, resynced) => {
        if (resynced) {
            return "";
        }

        const candidates = [];
        for (const category in currentIngame.upgradeDefs) {
            const upgradeLevel = root.hubGoals.getUpgradeLevel(category);
            if (upgradeLevel < currentIngame.upgradeDefs[category].length) {
                const tier = currentIngame.upgradeDefs[category][upgradeLevel];
                for (const next of tier.required) {
                    if (root.hubGoals.storedShapes[next.shape]) {
                        candidates.push(next.shape);
                    }
                }
            }
        }

        if (candidates.length === 0) {
            for (const category in currentIngame.upgradeDefs) {
                for (const tier of currentIngame.upgradeDefs[category]) {
                    for (const next of tier.required) {
                        if (root.hubGoals.storedShapes[next.shape]) {
                            candidates.push(next.shape);
                        }
                    }
                }
            }
        }

        if (candidates.length === 0) {
            return ": None";
        }

        const randomShape = rng.choice(candidates);
        const delta = Math.ceil(root.hubGoals.storedShapes[randomShape] / 2);
        root.hubGoals.storedShapes[randomShape] -= delta;
        return `: -${delta} ${randomShape}`;
    },
    [enumAPItems.trap_building_lock]: func_trapBuilding(enumTrapTypes.trapLocked),
    [enumAPItems.trap_building_throttle]: func_trapBuilding(enumTrapTypes.trapThrottled),
    [enumAPItems.trap_building_malfunction]: func_trapBuilding(enumTrapTypes.trapMalfunction),
    [enumAPItems.trap_inflation]: (root) => {
        ++connection.requiredShapesMultiplier;
        currentIngame.levelDefs = null;
        currentIngame.upgradeDefs = null;
        currentIngame.amountByLevelCache = null;
        root.gameMode.getLevelDefinitions();
        root.gameMode.getUpgrades();
        root.hubGoals.computeNextGoal();
        root.hud.parts.pinnedShapes.rerenderFull();
        root.buffers.cache.delete("hub");
        root.hud.update();
        return "";
    },
    [enumAPItems.trap_clear_belts]: (root, resynced) => {
        if (resynced) {
            return "";
        }

        root.logic.clearAllBeltsAndItems();
        return "";
    },
};

function func_progressiveUnlockReward(rewardsArr) {
    return function (root) {
        const rewards = [...rewardsArr];
        if (connection.unlockVariant === "backwards") {
            rewards.reverse();
        }

        const next = rewards.find((x) => !root.hubGoals.gainedRewards[x]);
        if (!next) {
            return "";
        }

        root.hubGoals.gainedRewards[next] = 1;
        return "";
    };
}
function func_unlockReward(reward) {
    return function (root) {
        root.hubGoals.gainedRewards[reward] = 1;
        return "";
    };
}
function func_upgradeAdditive(type, delta) {
    return function (root, resynced) {
        if (resynced) {
            return "";
        }

        const value = root.hubGoals.upgradeImprovements[type] + delta;
        root.hubGoals.upgradeImprovements[type] = clamp(value, 0.5, 60);
        return "";
    };
}
function func_upgradeMultiplicative(type, factor) {
    return function (root, resynced) {
        if (resynced) {
            return "";
        }

        const value = root.hubGoals.upgradeImprovements[type] * factor;
        root.hubGoals.upgradeImprovements[type] = clamp(value, 0.5, 60);
        return "";
    };
}
function func_trapBuilding(trapType) {
    return function (root, resynced) {
        if (resynced) {
            return "";
        }

        const candidates = [];
        for (const building in currentIngame[trapType]) {
            if (root.hubGoals.isRewardUnlocked(building)) {
                candidates.push(building);
            }
        }

        if (candidates.length === 0) {
            return ": None";
        }

        const randomBuilding = rng.choice(candidates);
        const randomDuration = rng.nextIntRange(15, 61);
        currentIngame[trapType][randomBuilding] = root.time.now() + randomDuration;

        const buildingName = T.mods.shapezipelago.itemReceivingBox.item[baseBuildingNames[randomBuilding]];
        const timeString = T.mods.shapezipelago.itemReceivingBox.extraInfo.time.replace("<x>", randomDuration);
        return `: ${buildingName} ${timeString}`;
    };
}
function func_randomItem(itemPool) {
    return function (root, resynced, index) {
        return rng.choice(itemPool)(root, resynced, index);
    };
}

function addShapesToStorage(root, addable, shortKey, amount) {
    const value = root.hubGoals.storedShapes[shortKey] ?? 0;
    const delta = addable[shortKey] > 1 ? Math.floor(addable[shortKey] / 2) : amount;
    root.hubGoals.storedShapes[shortKey] = value + delta;

    shapesanityAnalyzer(ShapeDefinition.fromShortKey(shortKey));
    return `: ${delta} ${shortKey}`;
}

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
    logger.debug(`Checking ${names.length} locations (goal==${goal}): ${names.toString()}`);
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
            logger.debug(`${resyncMessage} location ${name} with ID ${nextId}`);
        }
    }
    connection.sendLocationChecks(locids);
}

// This isn't an ideal location for this function, but it's the best option for now
export function resyncLocationChecks(root) {
    logger.debug("Resyncing already reached locations");
    const toResync = [];
    // resync levels
    for (let i = 1; i < root.hubGoals.level; ++i) {
        // current level is what is to be completed
        toResync.push(`Level ${i}`);
    }
    if (root.hubGoals.level > 20) {
        toResync.push("Level 20 Additional", "Level 20 Additional 2");
    }
    if (root.hubGoals.level > 1) {
        toResync.push("Level 1 Additional");
    }
    // resync upgrades
    for (const upgradeId of ["belt", "miner", "processors", "painting"]) {
        const currentLevel = root.hubGoals.getUpgradeLevel(upgradeId);
        for (let i = 1; i <= currentLevel; ++i) {
            toResync.push(getAPUpgradeLocationString(upgradeId, i));
        }
    }
    // Send resync packet
    bulkCheckLocation("Resynced", false, toResync);
    // resync shapesanity
    for (const [hash, amount] of Object.entries(root.hubGoals.storedShapes)) {
        if ((amount || 0) > 0) {
            shapesanityAnalyzer(ShapeDefinition.fromShortKey(hash));
        }
    }
    // resync goals
    if (connection.goal === "vanilla" || connection.goal === "mam") {
        if (connection.levelsToGenerate < root.hubGoals.level) {
            checkLocation("Checked", true);
        }
    } else if (connection.goal === "even_fasterer") {
        // upgrade levels start at 0, because it is used for index of upgrade definitions
        if (
            root.hubGoals.getUpgradeLevel("belt") + 1 >= connection.tiersToGenerate &&
            root.hubGoals.getUpgradeLevel("miner") + 1 >= connection.tiersToGenerate &&
            root.hubGoals.getUpgradeLevel("processors") + 1 >= connection.tiersToGenerate &&
            root.hubGoals.getUpgradeLevel("painting") + 1 >= connection.tiersToGenerate
        ) {
            checkLocation("Checked", true);
        }
    }
}

/**
 * @param {GameRoot} root
 * @param {import("archipelago.js").ReceivedItemsPacket} packet
 */
export function processItemsPacket(root, packet) {
    logger.debug(
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
        for (const reward in root.hubGoals.gainedRewards) {
            root.hubGoals.gainedRewards[reward] = 0;
        }
        // Resetting upgrade improvements to 1 (it's a multiplier)
        for (const id in root.hubGoals.upgradeImprovements) {
            root.hubGoals.upgradeImprovements[id] = 1;
        }
        // Re-receive items without popup
        const cachedprocessedItemCount = currentIngame.processedItemCount;
        for (let i = 0; i < cachedprocessedItemCount; ++i) {
            receiveItem(root, all_items[i], false, true, i);
        }
        // Backwards compatibility to 0.5.3
        const datacache = connection.client.data.slotData["lock_belt_and_extractor"];
        if (datacache !== null) {
            logger.debug(`Loaded lock_belt_and_extractor as backwards compatibility: ${datacache}`);
            if (!datacache) {
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_belt] = 1;
                root.hubGoals.gainedRewards[enumHubGoalRewards.reward_miner] = 1;
            }
        } else {
            logger.debug("No lock_belt_and_extractor found in slotData");
        }
    }
    if (currentIngame.processedItemCount === all_items.length) {
        logger.debug("Items up-to-date");
    } else if (currentIngame.processedItemCount === all_items.length - 1) {
        receiveItem(
            root,
            all_items[currentIngame.processedItemCount],
            true,
            false,
            currentIngame.processedItemCount
        );
        ++currentIngame.processedItemCount;
    } else if (currentIngame.processedItemCount === all_items.length - 2) {
        receiveItem(
            root,
            all_items[currentIngame.processedItemCount],
            true,
            false,
            currentIngame.processedItemCount
        );
        ++currentIngame.processedItemCount;
        receiveItem(
            root,
            all_items[currentIngame.processedItemCount],
            true,
            false,
            currentIngame.processedItemCount
        );
        ++currentIngame.processedItemCount;
    } else if (currentIngame.processedItemCount === all_items.length - 3) {
        receiveItem(
            root,
            all_items[currentIngame.processedItemCount],
            true,
            false,
            currentIngame.processedItemCount
        );
        ++currentIngame.processedItemCount;
        receiveItem(
            root,
            all_items[currentIngame.processedItemCount],
            true,
            false,
            currentIngame.processedItemCount
        );
        ++currentIngame.processedItemCount;
        receiveItem(
            root,
            all_items[currentIngame.processedItemCount],
            true,
            false,
            currentIngame.processedItemCount
        );
        ++currentIngame.processedItemCount;
    } else {
        const itemCounting = [];
        for (let i = currentIngame.processedItemCount; i < all_items.length; ++i) {
            itemCounting.push(receiveItem(root, all_items[i], false, false, i));
            ++currentIngame.processedItemCount;
        }
        modImpl.dialogs.showInfo(
            T.mods.shapezipelago.itemReceivingBox.title.multiple,
            itemCounting.join("<br />")
        );
    }
    currentIngame.itemReceiveSignal.dispatch();
}

/**
 * @param {GameRoot} root
 * @param {import("archipelago.js").NetworkItem} item
 * @param {boolean} showInfo
 * @param {boolean} resynced
 * @param {number} index
 */
function receiveItem(root, item, showInfo, resynced, index) {
    const itemName = connection.getItemName(item.item);
    const message = receiveItemFunctions[itemName](root, resynced, index);
    logger.debug("Processed item " + itemName + message);
    if (showInfo) {
        const sendingPlayerName = connection.getPlayername(item.player);
        const foundLocationName = connection.getLocationName(item.player, item.location);
        modImpl.dialogs.showInfo(
            T.mods.shapezipelago.itemReceivingBox.title.single,
            T.mods.shapezipelago.itemReceivingBox.item[itemName] +
                message +
                "<br />" +
                T.mods.shapezipelago.itemReceivingBox.foundBy
                    .replace("<player>", sendingPlayerName)
                    .replace("<location>", foundLocationName)
        );
        return "";
    } else {
        return T.mods.shapezipelago.itemReceivingBox.item[itemName] + message;
    }
}

/**
 * @param {ShapeDefinition} shape
 */
export function shapesanityAnalyzer(shape) {
    if (shape.layers.length !== 1) {
        return;
    }
    if (connection.shapesanityCache[shape.getHash()]) {
        return;
    }

    const shapesanity = toAPLocationShapesanityName();
    checkLocation("Checked", false, shapesanity);
    connection.shapesanityCache[shape.getHash()] = true;
}
