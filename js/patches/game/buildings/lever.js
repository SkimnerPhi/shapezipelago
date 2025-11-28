import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { connection } from "../../../connection";

export function classPatch({ $old }) {
    return {
        getIsUnlocked(root) {
            if (!connection) {
                return $old.getIsUnlocked(root);
            }

            return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_lever);
        },
    };
}
