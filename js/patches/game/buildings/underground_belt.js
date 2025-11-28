import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumUndergroundBeltVariants } from "shapez/game/buildings/underground_belt";
import { connection } from "../../../connection";
import { currentIngame } from "../../../ingame";

export function classPatch({ $old }) {
    return {
        getIsUnlocked(root) {
            if (currentIngame.trapLocked.tunnel) {
                return false;
            }
            if (!connection) {
                return $old(root);
            }

            return (
                $old(root) ||
                root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_underground_belt_tier_2)
            );
        },
        getAvailableVariants(root) {
            if (!connection) {
                return $old.getAvailableVariants(root);
            }

            const variants = [];
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_tunnel)) {
                variants.push(defaultBuildingVariant);
            }
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_underground_belt_tier_2)) {
                variants.push(enumUndergroundBeltVariants.tier2);
            }
            return variants;
        },
    };
}
