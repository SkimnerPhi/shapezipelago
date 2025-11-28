import { Signal } from "shapez/core/signal";
import { apDebugLog } from "./utils";
import { connection } from "./connection";
import { CLIENT_STATUS } from "archipelago.js";
import { enumTraps, modImpl } from "./global_data";
import { GameRoot } from "shapez/game/root";

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
