import { connection } from "../../../../global_data";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";

export function classPatch({ $old }) {
    return {
        switchLayers() {
            if (!connection) {
                return $old.switchLayers();
            }

            if (this.root.currentLayer === "regular") {
                if (
                    this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_wires) ||
                    this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_wires_painter_and_levers)
                ) {
                    this.root.currentLayer = "wires";
                }
            } else {
                this.root.currentLayer = "regular";
            }
            this.root.signals.editModeChanged.dispatch(this.root.currentLayer);
        },
    };
}
