import { GAME_LOADING_STATES } from "shapez/states/ingame";
import { currentIngame } from "../../ingame";
import { logger } from "../../main";

export function classPatch({ $old }) {
    return {
        stage4bResumeGame() {
            if (this.switchStage(GAME_LOADING_STATES.s4_B_resumeGame)) {
                if (!this.core.initExistingGame()) {
                    this.onInitializationFailure("Savegame is corrupt and can not be restored.");
                    return;
                }
                // This needs to "pause" if trying to connect
                if (!currentIngame.isTryingToConnect) {
                    logger.debug("Switching to stage 5 without trying to connect");
                    this.app.gameAnalytics.handleGameResumed();
                    this.stage5FirstUpdate();
                }
            }
        },
    };
}
