import { GameSystem } from "shapez/game/game_system";
import { currentIngame, enumTrapTypes } from "../global_data";

export class BuildingTrapSystem extends GameSystem {
    update() {
        const currentTime = this.root.time.now();

        for (const trapType in enumTrapTypes) {
            for (const building in currentIngame[trapType]) {
                const expireTime = currentIngame[trapType][building];
                if (!expireTime) {
                    continue;
                }
                if (currentTime < expireTime) {
                    continue;
                }

                currentIngame[trapType][building] = 0;
            }
        }
    }
}
