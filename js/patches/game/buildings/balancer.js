import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumBalancerVariants } from "shapez/game/buildings/balancer";
import { connection } from "../../../connection";
import { currentIngame } from "../../../ingame";

export function classPatch({ $old }) {
    return {
        getIsUnlocked(root) {
            if (currentIngame.trapLocked.balancer) {
                return false;
            }
            if (!connection) {
                return $old.getIsUnlocked(root);
            }

            return (
                $old.getIsUnlocked(root) ||
                root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_reward_merger) ||
                root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_reward_splitter)
            );
        },
        getAvailableVariants(root) {
            if (!connection) {
                return $old.getAvailableVariants(root);
            }

            const variants = [];
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_balancer)) {
                variants.push(defaultBuildingVariant);
            }
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_merger)) {
                variants.push(enumBalancerVariants.merger, enumBalancerVariants.mergerInverse);
            }
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_splitter)) {
                variants.push(enumBalancerVariants.splitter, enumBalancerVariants.splitterInverse);
            }
            return variants;
        },
    };
}
