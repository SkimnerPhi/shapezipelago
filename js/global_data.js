import {
    Client,
    CLIENT_PACKET_TYPE,
    CLIENT_STATUS,
    CONNECTION_STATUS,
    SERVER_PACKET_TYPE,
} from "archipelago.js";
import { Signal } from "shapez/core/signal";
import { GameRoot } from "shapez/game/root";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { Mod } from "shapez/mods/mod";

export const methodNames = {
    metaBuildings: {
        getAvailableVariants: "getAvailableVariants",
        getIsUnlocked: "getIsUnlocked",
        getAdditionalStatistics: "getAdditionalStatistics",
    },
};

export const customRewards = {
    belt: "reward_belt",
    extractor: "reward_extractor",
    cutter: "reward_cutter",
    wires: "reward_wires",
    switch: "reward_switch",
    trash: "reward_trash",
    painter_quad: "reward_painter_quad",
    ap: "reward_ap",
    easter_egg: "reward_easter_egg",
};

export const upgradeIdNames = {
    belt: "Belt",
    miner: "Miner",
    processors: "Processors",
    painting: "Painting",
};

export const achievementNames = {
    "belt500Tiles": "I need trains",
    "blueprint100k": "It's piling up",
    "blueprint1m": "I'll use it later",
    "completeLvl26": "Freedom",
    "cutShape": "Cutter",
    "destroy1000": "Perfectionist",
    "irrelevantShape": "Oops",
    "level100": "Is this the end?",
    "level50": "Can't stop",
    "logoBefore18": "A bit early?",
    "mam": "MAM (Make Anything Machine)",
    "mapMarkers15": "GPS",
    "oldLevel17": "Memories from the past",
    "openWires": "The next dimension",
    "paintShape": "Painter",
    "place5000Wires": "Computer Guy",
    "placeBlueprint": "Now it's easy",
    "placeBp1000": "Copy-Pasta",
    "play1h": "Getting into it",
    "produceLogo": "The logo!",
    "produceMsLogo": "I've seen that before ...",
    "produceRocket": "To the moon",
    "rotateShape": "Rotater",
    "stack4Layers": "Stack overflow",
    "stackShape": "Wait, they stack?",
    "store100Unique": "It's a mess",
    "storeShape": "Storage",
    "throughputBp25": "Efficiency 1",
    "throughputBp50": "Efficiency 2",
    "throughputLogo25": "Branding specialist 1",
    "throughputLogo50": "Branding specialist 2",
    "throughputRocket10": "Preparing to launch",
    "throughputRocket20": "SpaceY",
    "trash1000": "Get rid of them",
    "unlockWires": "Wires",
    "upgradesTier5": "Faster",
    "upgradesTier8": "Even faster",
    "darkMode": "My eyes no longer hurt",
    "speedrunBp30": "Speedrun Master",
    "speedrunBp60": "Speedrun Novice",
    "speedrunBp120": "Not an idle game",
    "noBeltUpgradesUntilBp": "It's so slow",
    "noInverseRotater": "King of Inefficiency",
    "play10h": "It's been a long time",
    "play20h": "Addicted",
};

const translate = [
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

export const subShapeNames = {
    rect: "Square",
    circle: "Circle",
    star: "Star",
    windmill: "Windmill",
};

export const colorNames = {
    red: "Red",
    green: "Green",
    blue: "Blue",

    yellow: "Yellow",
    purple: "Purple",
    cyan: "Cyan",

    white: "White",
    uncolored: "Uncolored",
};

export const getIsUnlockedForTrap = {
    belt: (root) => root.hubGoals.isRewardUnlocked(customRewards.belt) && !currentIngame.trapLocked.belt,
    balancer: (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_balancer) && !currentIngame.trapLocked.balancer,
    tunnel: (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_tunnel) && !currentIngame.trapLocked.tunnel,
    extractor: (root) => root.hubGoals.isRewardUnlocked(customRewards.extractor) && !currentIngame.trapLocked.extractor,
    cutter: (root) => root.hubGoals.isRewardUnlocked(customRewards.cutter) && !currentIngame.trapLocked.cutter,
    cutter_quad: (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_quad) && !currentIngame.trapLocked.cutter,
    rotator: (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater) && !currentIngame.trapLocked.rotator,
    rotator_ccw: (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater_ccw) && !currentIngame.trapLocked.rotator,
    rotator_180: (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater_180) && !currentIngame.trapLocked.rotator,
    stacker: (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_stacker) && !currentIngame.trapLocked.stacker,
    painter: (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_painter) && !currentIngame.trapLocked.painter,
    painter_quad: (root) => root.hubGoals.isRewardUnlocked(customRewards.painter_quad) && !currentIngame.trapLocked.painter,
    mixer: (root) => root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_mixer) && !currentIngame.trapLocked.mixer,
    trash: (root) => root.hubGoals.isRewardUnlocked(customRewards.trash) && !currentIngame.trapLocked.trash,
};

/**
 * @param {number} number
 */
export function roman(number) {
    let rom = "";
    for (let i = 0; i < translate.length; ++i) {
        while (number >= translate[i].key) {
            rom = rom + translate[i].val;
            number = number - translate[i].key;
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
        prefab_GameHint.innerHTML = ("ERROR " + shapez.T.mods.shapezipelago.infoBox.aptry.title + "<br />" + text);
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

/**
 * @type {Mod}
 */
export let modImpl;

/**
 * @param {Mod} m
 */
export function setModImpl(m) {
    modImpl = m;
}

/**
 * @type {Connection}
 */
export let connection;

export class Connection {
    client = new Client();
    disconnectListener = null;

    /**
     * @param {{hostname: string;port: number;game: string;name: string;items_handling: number;password: string;protocol?: "ws" | "wss";version?: {major: number;minor: number;build: number;};uuid?: string;tags?: string[];}} connectInfo
     * @param {{(packet: import("archipelago.js").ReceivedItemsPacket): void;(packet: import("archipelago.js").ReceivedItemsPacket): void;}} processItemsPacket
     * @returns {Promise}
     */
    tryConnect(connectInfo, processItemsPacket) {
        apDebugLog("Trying to connect to server");
        // Phar (dev of the library) said the library already follows 0.5.0 protocol
        connectInfo.version = {
            major: 0,
            minor: 5,
            build: 0,
        };
        return this.client
            .connect(connectInfo)
            .then(() => {
                apUserLog("Connected to the server");
                connection = this;
                this.reportStatusToServer(CLIENT_STATUS.CONNECTED);
                this.connectionInformation = connectInfo;

                this.client.addListener(SERVER_PACKET_TYPE.PRINT_JSON, (packet, message) => {
                    // @ts-ignore
                    apUserLog((packet.slot !== null ? this.client.players.name(packet.slot) + ": " : "") + message);
                });
                this.client.addListener(SERVER_PACKET_TYPE.RECEIVED_ITEMS, processItemsPacket);
                this.disconnectListener = setInterval(() => {
                    if (this.client.status === CONNECTION_STATUS.DISCONNECTED) {
                        modImpl.dialogs.showInfo(
                            shapez.T.mods.shapezipelago.connectionLostBox.title,
                            shapez.T.mods.shapezipelago.connectionLostBox.message
                        );
                        window.clearInterval(this.disconnectListener);
                        this.disconnectListener = null;
                    }
                }, 5000);

                this.gamepackage = this.client.data.package.get("shapez");

                const slotData = this.client.data.slotData;

                // Earliest slotData version: 0.5.3

                // Always string array, but javascript
                let dataCache = slotData["shapesanity"].valueOf();
                if (dataCache instanceof Array) {
                    this.shapesanityNames = dataCache;
                    apDebugLog(`Loaded slotData shapesanity (length=${dataCache.length})`);
                } else {
                    apUserLog(`Error on loading shapesanity from slotData: class=${dataCache.constructor.name}`);
                    modImpl.dialogs.showInfo(
                        shapez.T.mods.shapezipelago.infoBox.impossible.title,
                        `${shapez.T.mods.shapezipelago.infoBox.impossible.report}<br />${shapez.T.mods.shapezipelago.infoBox.impossible.shapesanitySlotData}`
                    );
                }

                // Always string
                this.goal = slotData["goal"].toString();
                apDebugLog(`Loaded slotData goal=${this.goal}`);

                // Always integer, equals location count (without goal)
                this.levelsToGenerate = Number(slotData["maxlevel"]);
                apDebugLog(`Loaded slotData maxlevel=${this.levelsToGenerate}`);
                if (this.goal === "vanilla" || this.goal === "mam") {
                    ++this.levelsToGenerate;
                }

                // Always integer
                this.tiersToGenerate = Number(slotData["finaltier"]);
                apDebugLog(`Loaded slotData finaltier=${this.tiersToGenerate}`);

                this.slotId = this.client.data.slot;
                apDebugLog(`Loaded slotId=${this.slotId}`);

                this.randomStepsLength = new Array(5);
                for (let phaseNumber = 0; phaseNumber < 5; ++phaseNumber) {
                    // Always integer
                    this.randomStepsLength[phaseNumber] = Number(slotData[`Phase ${phaseNumber} length`]);
                    apDebugLog(`Loaded slotData randomStepsLength[${phaseNumber}]: ${this.randomStepsLength[phaseNumber]}`);
                }

                for (let phaseNumber = 1; phaseNumber <= 5; ++phaseNumber) {
                    // both always string
                    this.positionOfLevelBuilding[slotData[`Level building ${phaseNumber}`]] = phaseNumber;
                    this.positionOfUpgradeBuilding[slotData[`Upgrade building ${phaseNumber}`]] = phaseNumber;
                }
                for (const buildingName in this.positionOfLevelBuilding) {
                    apDebugLog(`Initialized phase number ${this.positionOfLevelBuilding[buildingName]} for level and ${
                        this.positionOfUpgradeBuilding[buildingName]} for upgrade building ${buildingName}`);
                }

                // Always integer
                this.throughputLevelsRatio = Number(slotData["throughput_levels_ratio"]);
                apDebugLog(`Loaded slotData throughput_levels_ratio=${this.throughputLevelsRatio}`);

                // Always string
                this.levelsLogic = slotData["randomize_level_logic"].toString();
                apDebugLog(`Loaded slotData randomize_level_logic=${this.levelsLogic}`);

                // Always string
                this.upgradesLogic = slotData["randomize_upgrade_logic"].toString();
                apDebugLog(`Loaded slotData randomize_upgrade_logic=${this.upgradesLogic}`);

                // Always integer
                this.clientSeed = Number(slotData["seed"]);
                apDebugLog(`Loaded slotData seed=${this.clientSeed}`);

                // Always integer
                this.requiredShapesMultiplier = Number(slotData["required_shapes_multiplier"]);
                apDebugLog(`Loaded slotData required_shapes_multiplier=${this.requiredShapesMultiplier}`);

                // Always boolean
                this.isRandomizedLevels = Boolean(slotData["randomize_level_requirements"]);
                apDebugLog(`Loaded slotData randomize_level_requirements=${this.isRandomizedLevels}`);

                // Always boolean
                this.isRandomizedUpgrades = Boolean(slotData["randomize_upgrade_requirements"]);
                apDebugLog(`Loaded slotData randomize_upgrade_requirements=${this.isRandomizedUpgrades}`);

                for (const cat of ["belt", "miner", "processors", "painting"]) {
                    // Always number
                    this.categoryRandomBuildingsAmounts[cat] = Number(slotData[`${cat} category buildings amount`]);
                    apDebugLog(`Loaded slotData "${cat} category buildings amount"=${this.categoryRandomBuildingsAmounts[cat]}`);
                }

                // Always boolean
                this.isSameLate = Boolean(slotData["same_late_upgrade_requirements"]);
                apDebugLog(`Loaded slotData same_late_upgrade_requirements=${this.isSameLate}`);

                // undefined until 0.5.5, boolean since 0.5.6
                // Boolean(undefined) => false
                this.isFloatingLayersAllowed = Boolean(slotData["allow_floating_layers"]);
                apDebugLog(`Loaded slotData allow_floating_layers=${slotData["allow_floating_layers"]}`);

                // undefined until 0.5.10, float since 0.5.11
                dataCache = slotData["complexity_growth_gradient"];
                this.complexityGrowthGradient = dataCache === null ? 0.5 : Number(dataCache);
                apDebugLog(`Loaded slotData complexity_growth_gradient=${slotData["complexity_growth_gradient"]}`);

                // undefined until at least 0.5.13, string since TBA
                dataCache = slotData["unlock_variant"];
                this.unlockVariant = dataCache === null ? "individual" : String(dataCache);
                apDebugLog(`Loaded slotData unlock_variant=${slotData["unlock_variant"]}`);

                // undefined until 0.5.13, boolean since TBA
                // Boolean(undefined) => false
                this.isToolbarShuffled = Boolean(slotData["toolbar_shuffling"]);
                apDebugLog(`Loaded slotData toolbar_shuffling=${slotData["toolbar_shuffling"]}`);
            })
            .catch(error => {
                apUserLog("Failed to connect: " + error.name + ", " + error.message);
            });
    }

    disconnect() {
        apUserLog("Disconnecting from the server");
        if (this.disconnectListener) {
            window.clearInterval(this.disconnectListener);
            this.disconnectListener = null;
        }
        this.client.disconnect();
        connection = null;
    }

    /**
     * @type {String}
     */
    goal;
    /**
     * @type {number}
     */
    levelsToGenerate;
    /**
     * @type {number}
     */
    tiersToGenerate;
    /**
     * @type {number}
     */
    requiredShapesMultiplier;
    /**
     * @type {boolean}
     */
    isRandomizedLevels;
    /**
     * @type {boolean}
     */
    isRandomizedUpgrades;
    /**
     * @type {string}
     */
    levelsLogic;
    /**
     * @type {string}
     */
    upgradesLogic;
    /**
     * @type {number}
     */
    throughputLevelsRatio;
    /**
     * @type {boolean}
     */
    isSameLate;
    positionOfLevelBuilding = {
        "Cutter": 0,
        "Rotator": 0,
        "Stacker": 0,
        "Painter": 0,
        "Color Mixer": 0,
    };
    positionOfUpgradeBuilding = {
        "Cutter": 0,
        "Rotator": 0,
        "Stacker": 0,
        "Painter": 0,
        "Color Mixer": 0,
    };
    /**
     * @type {number[]}
     */
    randomStepsLength;
    categoryRandomBuildingsAmounts = {
        belt: 0,
        miner: 0,
        processors: 0,
        painting: 0,
    };
    /**
     * @type {number}
     */
    clientSeed;
    /**
     * @type {string[]}
     */
    shapesanityNames;
    /**
     * @type {import("archipelago.js").GamePackage}
     */
    gamepackage;
    /**
     * @type {{[x:string]: boolean}}
     */
    shapesanityCache = {};
    /**
     * @type {number}
     */
    slotId;
    blueprintShape = "CbCbCbRb:CwCwCwCw";
    /**
     * @type {{ hostname: string; port: number; game: string; name: string; items_handling: number; password: string; protocol?: "ws" | "wss"; version?: { major: number; minor: number; build: number; }; uuid?: string; tags?: string[]; }}
     */
    connectionInformation;
    /**
     * @type {boolean}
     */
    isFloatingLayersAllowed;
    // This was never intended to be private, but to catch cheaters
    debug = 20010707;
    /**
     * @type {number}
     */
    complexityGrowthGradient;
    /**
     * @type {string}
     */
    unlockVariant;
    /**
     * @type {boolean}
     */
    isToolbarShuffled;

    /**
     * @returns {String[]}
     */
    getCheckedLocationNames() {
        const names = [];
        const checkedList = this.client.locations.checked;
        for (const checkedId of checkedList) {
            names.push(this.client.locations.name(this.slotId, checkedId));
        }
        return names;
    }

    requestItemPackage() {
        this.client.send({ cmd: CLIENT_PACKET_TYPE.SYNC });
    }

    /**
     * @param {import("archipelago.js").ClientStatus} status
     */
    reportStatusToServer(status) {
        this.client.updateStatus(status);
    }

    /**
     * @param {number[]} locids
     */
    sendLocationChecks(locids) {
        this.client.send({ cmd: CLIENT_PACKET_TYPE.LOCATION_CHECKS, locations: locids });
    }

    /**
     * @param {number} id
     */
    getItemName(id) {
        return this.client.items.name("shapez", id);
    }

    /**
     * @param {number} id
     */
    getPlayername(id) {
        return this.client.players.name(id);
    }

    /**
     * @param {number} playerid
     * @param {number} locid
     */
    getLocationName(playerid, locid) {
        return connection.client.locations.name(playerid, locid);
    }
}

/**
 * @type {Ingame}
 */
export let currentIngame;

export class Ingame {
    /**
     * @type {GameRoot}
     */
    root;
    /**
     * @type {boolean}
     */
    isAPSave;
    /**
     * @type {number}
     */
    processedItemCount = 0;
    /**
     * @type {NodeJS.Timer}
     */
    efficiency3Interval;
    trapLocked = {
        belt: false,
        balancer: false,
        tunnel: false,
        extractor: false,
        cutter: false,
        rotator: false,
        stacker: false,
        painter: false,
        mixer: false,
        trash: false,
    };
    trapThrottled = {
        belt: false,
        balancer: false,
        tunnel: false,
        extractor: false,
        cutter: false,
        rotator: false,
        stacker: false,
        painter: false,
        mixer: false,
    };
    trapMalfunction = {
        cutter: false,
        cutter_quad: false,
        rotator: false,
        rotator_ccw: false,
        rotator_180: false,
        stacker: false,
        painter: false,
        painter_quad: false,
    };
    /**
     * @type {{shape: string; required: number; reward: string; throughputOnly: boolean;}[]}
     */
    levelDefs;
    /**
     * @type {{[x: string]: {required: {shape: string; amount: number;}[]; excludePrevious: boolean; improvement: number;}[]}}
     */
    upgradeDefs;
    /**
     * @type {boolean}
     */
    isItemsResynced = false;
    translated = {};
    /**
     * @type {number[]}
     */
    amountByLevelCache;
    /**
     * @type {number[]}
     */
    throughputByLevelCache;
    isTryingToConnect = modImpl.settings.debugTryingToConnectDefault;
    /**
     * @type {boolean[]}
     */
    scoutedShapesanity;
    /**
     * @type {HTMLCanvasElement[]}
     */
    shapesanityExamples = [];
    /**
     * @type {String[]}
     */
    shapesanityExamplesHash = [];
    /**
     * @type {TypedSignal<[]>}
     */
    itemReceiveSignal = new Signal();
    /**
     * @type {Object<string, Function>}
     */
    lateToolbarInitializations = {};
    /**
     * @type {{ hostname: string; port: number; game: string; name: string; items_handling: number; password: string; protocol?: "ws" | "wss"; version?: { major: number; minor: number; build: number; }; uuid?: string; tags?: string[]; }}
     */
    connectionInformation;

    constructor() {
        apDebugLog("Constructing Ingame object");
        currentIngame = this;
        apDebugLog("Ingame object constructed");
    }

    /**
     * @param {GameRoot} root
     */
    afterRootInitialization(root) {
        this.root = root;
        this.isAPSave = !!connection;
    }

    leave() {
        apDebugLog("Leaving and destroying Ingame object");
        if (connection) {
            connection.reportStatusToServer(CLIENT_STATUS.CONNECTED);
        }
        this.clearEfficiency3Interval();
        currentIngame = null;
    }

    /**
     * @param {() => void} f
     * @param {number} ms
     */
    startEfficiency3Interval(f, ms) {
        apDebugLog("Starting efficiency3Interval");
        this.efficiency3Interval = setInterval(f, ms);
    }

    clearEfficiency3Interval() {
        if (this.efficiency3Interval) {
            window.clearInterval(this.efficiency3Interval);
            this.efficiency3Interval = null;
        }
    }
}
