import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { T } from "shapez/translations";
import { round1DigitLocalized } from "shapez/core/utils";
import { connection } from "../../../connection";
import { currentIngame } from "../../../ingame";

export function classPatch({ $old }) {
    return {
        getIsUnlocked(root) {
            if (currentIngame.trapLocked.extractor) {
                return false;
            }
            if (!connection) {
                return $old.getIsUnlocked(root);
            }

            return (
                root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_miner) ||
                root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_miner_chainable)
            );
        },
        getAdditionalStatistics(root, variant) {
            const beltSpeed = root.hubGoals.getBeltBaseSpeed();
            const buildingSpeed = root.hubGoals.getMinerBaseSpeed();

            const stats = $old.getAdditionalStatistics(root, variant);
            stats.push([
                T.mods.shapezipelago.statisticsBox.perBelt,
                round1DigitLocalized(beltSpeed / buildingSpeed),
            ]);
            return stats;
        },
    };
}
