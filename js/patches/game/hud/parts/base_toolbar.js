import { RandomNumberGenerator } from "shapez/core/rng";
import { GameRoot } from "shapez/game/root";
import { MetaBuilding } from "shapez/game/meta_building";
import { connection } from "../../../../connection";
import { currentIngame } from "../../../../ingame";
import { logger } from "../../../../main";

export function classPatch({ $old }) {
    return {
        shuffle() {
            /**
             * @type {Array<typeof MetaBuilding>}
             */
            const allBuildings = this.allBuildings.slice();
            const random = new RandomNumberGenerator(connection.clientSeed);
            this.primaryBuildings = [];
            this.secondaryBuildings = [];
            while (allBuildings.length) {
                const nextBuilding = allBuildings.splice(
                    random.nextIntRange(0, allBuildings.length),
                    1
                )[0];
                if (this.primaryBuildings.length >= 12 || random.choice([true, false])) {
                    this.secondaryBuildings.push(nextBuilding);
                } else {
                    this.primaryBuildings.push(nextBuilding);
                }
            }
            if (this.primaryBuildings.length === 0) {
                this.primaryBuildings.push(this.secondaryBuildings.pop());
            }
        },
        initialize() {
            /**@type {GameRoot} */
            const root = this.root;
            if (!root.savegame.hasGameDump()) {
                logger.debug("Initializing toolbar");
                if (connection && connection.isToolbarShuffled) {
                    this.shuffle();
                }
                $old.initialize();
            } else {
                currentIngame.lateToolbarInitializations[this.htmlElementId] = () => {
                    logger.debug("Late initializing toolbar");
                    if (connection && connection.isToolbarShuffled) {
                        this.shuffle();
                    }
                    $old.initialize();
                };
            }
        },
    };
}
