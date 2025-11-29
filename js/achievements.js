import { GameRoot } from "shapez/game/root";
import {
    AchievementCollection,
    AchievementProviderInterface,
    ACHIEVEMENTS,
} from "shapez/platform/achievement_provider";
import { checkLocation } from "./server_communication";
import { AchievementProxy } from "shapez/game/achievement_proxy";
import { enumAchievementToAPLocations } from "./archipelago/ap_location";
import { connection } from "./connection";
import { logger } from "./main";

export class AchievementLocationProxy extends AchievementProxy {
    /**
     * @param {GameRoot} root
     */
    constructor(root) {
        logger.debug("Constructing AchievementLocationProxy");
        root.app.achievementProvider = new AchievementLocationProvider(root.app);
        super(root);
    }
}

export class AchievementLocationProvider extends AchievementProviderInterface {
    constructor(app) {
        super(app);
        this.initialized = false;
        this.collection = new AchievementCollection(this.activate.bind(this));
        logger.debug("Collection created with " + this.collection.map.size + " achievements");
    }

    initialize() {
        return Promise.resolve();
    }

    onLoad(root) {
        this.root = root;
        try {
            this.collection = new AchievementCollection(this.activate.bind(this));
            this.collection.initialize(root);
            logger.debug("Initialized " + this.collection.map.size + " relevant achievements");
            return Promise.resolve();
        } catch (err) {
            logger.debug("Failed to initialize the collection");
            return Promise.reject(err);
        }
    }

    activate(key) {
        if (connection) {
            if (ACHIEVEMENTS[key]) {
                checkLocation("Checked", false, enumAchievementToAPLocations[key]);
            }
        }
        return Promise.resolve();
    }

    hasAchievements() {
        return true;
    }
}
