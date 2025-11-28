import { RandomNumberGenerator } from "shapez/core/rng";
import { GameRoot } from "shapez/game/root";
import { MetaBuilding } from "shapez/game/meta_building";
import { apDebugLog, apTry } from "../../../../utils";
import { connection } from "../../../../connection";
import { currentIngame } from "../../../../ingame";

export function classPatch({ $old }) {
    return {
        initialize() {
            apTry("Toolbar initializing failed", () => {
                // This code is used in 2 separate places
                const shuffle = () => {
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
                };
                /**@type {GameRoot} */
                const root = this.root;
                if (!root.savegame.hasGameDump()) {
                    apDebugLog("Initializing toolbar");
                    if (connection && connection.isToolbarShuffled) {
                        shuffle();
                    }
                    $old.initialize();
                } else {
                    currentIngame.lateToolbarInitializations[this.htmlElementId] = () => {
                        apDebugLog("Late initializing toolbar");
                        if (connection && connection.isToolbarShuffled) {
                            shuffle();
                        }
                        $old.initialize();
                    };
                }
            });
        },
    };
}
