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
import { apDebugLog, apUserLog } from "./utils";

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

export const enumTrapTypes = {
    trapLocked: "trapLocked",
    trapThrottled: "trapThrottled",
    trapMalfunction: "trapMalfunction",
};

export const enumTraps = {
    belt: "belt",
    balancer: "balancer",
    tunnel: "tunnel",
    extractor: "extractor",
    cutter: "cutter",
    cutter_quad: "cutter_quad",
    rotator: "rotator",
    stacker: "stacker",
    painter: "painter",
    painter_quad: "painter_quad",
    mixer: "mixer",
    trash: "trash",
};

export const enumTrapToHubGoalRewards = {
    [enumTraps.belt]: enumHubGoalRewards.reward_belt,
    [enumTraps.balancer]: enumHubGoalRewards.reward_balancer,
    [enumTraps.tunnel]: enumHubGoalRewards.reward_tunnel,
    [enumTraps.extractor]: enumHubGoalRewards.reward_miner,
    [enumTraps.cutter]: enumHubGoalRewards.reward_cutter,
    [enumTraps.cutter_quad]: enumHubGoalRewards.reward_cutter,
    [enumTraps.rotator]: enumHubGoalRewards.reward_rotater,
    [enumTraps.stacker]: enumHubGoalRewards.reward_stacker,
    [enumTraps.painter]: enumHubGoalRewards.reward_painter,
    [enumTraps.painter_quad]: enumHubGoalRewards.reward_painter_quad,
    [enumTraps.mixer]: enumHubGoalRewards.reward_mixer,
    [enumTraps.trash]: enumHubGoalRewards.reward_trash,
};

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
        [enumTraps.belt]: 0,
        [enumTraps.balancer]: 0,
        [enumTraps.tunnel]: 0,
        [enumTraps.extractor]: 0,
        [enumTraps.cutter]: 0,
        [enumTraps.rotator]: 0,
        [enumTraps.stacker]: 0,
        [enumTraps.painter]: 0,
        [enumTraps.mixer]: 0,
        [enumTraps.trash]: 0,
    };
    trapThrottled = {
        [enumTraps.belt]: 0,
        [enumTraps.balancer]: 0,
        [enumTraps.tunnel]: 0,
        [enumTraps.extractor]: 0,
        [enumTraps.cutter]: 0,
        [enumTraps.rotator]: 0,
        [enumTraps.stacker]: 0,
        [enumTraps.painter]: 0,
        [enumTraps.mixer]: 0,
    };
    trapMalfunction = {
        [enumTraps.cutter]: 0,
        [enumTraps.cutter_quad]: 0,
        [enumTraps.rotator]: 0,
        [enumTraps.rotator_ccw]: 0,
        [enumTraps.rotator_180]: 0,
        [enumTraps.stacker]: 0,
        [enumTraps.painter]: 0,
        [enumTraps.painter_quad]: 0,
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
