import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumRotaterVariants } from "shapez/game/buildings/rotater";
import { T } from "shapez/translations";
import { round1DigitLocalized } from "shapez/core/utils";
import { enumItemProcessorTypes } from "shapez/game/components/item_processor";
import { connection } from "../../../connection";
import { currentIngame } from "../../../ingame";

const enumRotaterVariantsToProcessorTypes = {
    [defaultBuildingVariant]: enumItemProcessorTypes.rotater,
    [enumRotaterVariants.ccw]: enumItemProcessorTypes.rotaterCCW,
    [enumRotaterVariants.rotate180]: enumItemProcessorTypes.rotater180,
};

export function classPatch({ $old }) {
    return {
        getIsUnlocked(root) {
            if (currentIngame.trapLocked.rotator) {
                return false;
            }
            if (!connection) {
                return $old.getIsUnlocked(root);
            }

            return (
                $old.getIsUnlocked(root) ||
                root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater_ccw) ||
                root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater_180)
            );
        },
        getAvailableVariants(root) {
            if (!connection) {
                return $old.getAvailableVariants(root);
            }

            const variants = [];
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater)) {
                variants.push(defaultBuildingVariant);
            }
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater_ccw)) {
                variants.push(enumRotaterVariants.ccw);
            }
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater_180)) {
                variants.push(enumRotaterVariants.rotate180);
            }
            return variants;
        },
        getAdditionalStatistics(root, variant) {
            const beltSpeed = root.hubGoals.getBeltBaseSpeed();
            const buildingSpeed = root.hubGoals.getProcessorBaseSpeed(
                enumRotaterVariantsToProcessorTypes[variant]
            );

            const stats = $old.getAdditionalStatistics(root, variant);
            stats.push([
                T.mods.shapezipelago.statisticsBox.perBelt,
                round1DigitLocalized(beltSpeed / buildingSpeed),
            ]);
            return stats;
        },
    };
}
