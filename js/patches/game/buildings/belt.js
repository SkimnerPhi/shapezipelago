import { connection, currentIngame } from "../../../global_data";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";

export function classPatch({ $old }) {
    return {
        getIsUnlocked(root) {
            if (currentIngame.trapLocked.belt) {
                return false;
            }

            if (!connection) {
                return $old.getIsUnlocked(root);
            }

            return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_belt);
        },
    };
}
