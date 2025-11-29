import {
    Client,
    CLIENT_PACKET_TYPE,
    CLIENT_STATUS,
    CONNECTION_STATUS,
    SERVER_PACKET_TYPE,
} from "archipelago.js";

import { modImpl, logger } from "./main";

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
        logger.debug("Trying to connect to server");
        // Phar (dev of the library) said the library already follows 0.5.0 protocol
        connectInfo.version = {
            major: 0,
            minor: 5,
            build: 0,
        };
        return this.client
            .connect(connectInfo)
            .then(() => {
                logger.log("Connected to the server");
                connection = this;
                this.reportStatusToServer(CLIENT_STATUS.CONNECTED);
                this.connectionInformation = connectInfo;

                this.client.addListener(SERVER_PACKET_TYPE.PRINT_JSON, (packet, message) => {
                    // @ts-ignore
                    logger.log((packet.slot !== null ? this.client.players.name(packet.slot) + ": " : "") + message);
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
                    logger.debug(`Loaded slotData shapesanity (length=${dataCache.length})`);
                } else {
                    logger.log(`Error on loading shapesanity from slotData: class=${dataCache.constructor.name}`);
                    modImpl.dialogs.showInfo(
                        shapez.T.mods.shapezipelago.infoBox.impossible.title,
                        `${shapez.T.mods.shapezipelago.infoBox.impossible.report}<br />${shapez.T.mods.shapezipelago.infoBox.impossible.shapesanitySlotData}`
                    );
                }

                // Always string
                this.goal = slotData["goal"].toString();
                logger.debug(`Loaded slotData goal=${this.goal}`);

                // Always integer, equals location count (without goal)
                this.levelsToGenerate = Number(slotData["maxlevel"]);
                logger.debug(`Loaded slotData maxlevel=${this.levelsToGenerate}`);
                if (this.goal === "vanilla" || this.goal === "mam") {
                    ++this.levelsToGenerate;
                }

                // Always integer
                this.tiersToGenerate = Number(slotData["finaltier"]);
                logger.debug(`Loaded slotData finaltier=${this.tiersToGenerate}`);

                this.slotId = this.client.data.slot;
                logger.debug(`Loaded slotId=${this.slotId}`);

                this.randomStepsLength = new Array(5);
                for (let phaseNumber = 0; phaseNumber < 5; ++phaseNumber) {
                    // Always integer
                    this.randomStepsLength[phaseNumber] = Number(slotData[`Phase ${phaseNumber} length`]);
                    logger.debug(`Loaded slotData randomStepsLength[${phaseNumber}]: ${this.randomStepsLength[phaseNumber]}`);
                }

                for (let phaseNumber = 1; phaseNumber <= 5; ++phaseNumber) {
                    // both always string
                    this.positionOfLevelBuilding[slotData[`Level building ${phaseNumber}`]] = phaseNumber;
                    this.positionOfUpgradeBuilding[slotData[`Upgrade building ${phaseNumber}`]] = phaseNumber;
                }
                for (const buildingName in this.positionOfLevelBuilding) {
                    logger.debug(`Initialized phase number ${this.positionOfLevelBuilding[buildingName]} for level and ${
                        this.positionOfUpgradeBuilding[buildingName]} for upgrade building ${buildingName}`);
                }

                // Always integer
                this.throughputLevelsRatio = Number(slotData["throughput_levels_ratio"]);
                logger.debug(`Loaded slotData throughput_levels_ratio=${this.throughputLevelsRatio}`);

                // Always string
                this.levelsLogic = slotData["randomize_level_logic"].toString();
                logger.debug(`Loaded slotData randomize_level_logic=${this.levelsLogic}`);

                // Always string
                this.upgradesLogic = slotData["randomize_upgrade_logic"].toString();
                logger.debug(`Loaded slotData randomize_upgrade_logic=${this.upgradesLogic}`);

                // Always integer
                this.clientSeed = Number(slotData["seed"]);
                logger.debug(`Loaded slotData seed=${this.clientSeed}`);

                // Always integer
                this.requiredShapesMultiplier = Number(slotData["required_shapes_multiplier"]);
                logger.debug(`Loaded slotData required_shapes_multiplier=${this.requiredShapesMultiplier}`);

                // Always boolean
                this.isRandomizedLevels = Boolean(slotData["randomize_level_requirements"]);
                logger.debug(`Loaded slotData randomize_level_requirements=${this.isRandomizedLevels}`);

                // Always boolean
                this.isRandomizedUpgrades = Boolean(slotData["randomize_upgrade_requirements"]);
                logger.debug(`Loaded slotData randomize_upgrade_requirements=${this.isRandomizedUpgrades}`);

                for (const cat of ["belt", "miner", "processors", "painting"]) {
                    // Always number
                    this.categoryRandomBuildingsAmounts[cat] = Number(slotData[`${cat} category buildings amount`]);
                    logger.debug(`Loaded slotData "${cat} category buildings amount"=${this.categoryRandomBuildingsAmounts[cat]}`);
                }

                // Always boolean
                this.isSameLate = Boolean(slotData["same_late_upgrade_requirements"]);
                logger.debug(`Loaded slotData same_late_upgrade_requirements=${this.isSameLate}`);

                // undefined until 0.5.5, boolean since 0.5.6
                // Boolean(undefined) => false
                this.isFloatingLayersAllowed = Boolean(slotData["allow_floating_layers"]);
                logger.debug(`Loaded slotData allow_floating_layers=${slotData["allow_floating_layers"]}`);

                // undefined until 0.5.10, float since 0.5.11
                dataCache = slotData["complexity_growth_gradient"];
                this.complexityGrowthGradient = dataCache === null ? 0.5 : Number(dataCache);
                logger.debug(`Loaded slotData complexity_growth_gradient=${slotData["complexity_growth_gradient"]}`);

                // undefined until at least 0.5.13, string since TBA
                dataCache = slotData["unlock_variant"];
                this.unlockVariant = dataCache === null ? "individual" : String(dataCache);
                logger.debug(`Loaded slotData unlock_variant=${slotData["unlock_variant"]}`);

                // undefined until 0.5.13, boolean since TBA
                // Boolean(undefined) => false
                this.isToolbarShuffled = Boolean(slotData["toolbar_shuffling"]);
                logger.debug(`Loaded slotData toolbar_shuffling=${slotData["toolbar_shuffling"]}`);
            })
            .catch((error) => {
                logger.log("Failed to connect: " + error.name + ", " + error.message);
            });
    }

    disconnect() {
        logger.log("Disconnecting from the server");
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
