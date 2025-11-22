import { connection, currentIngame } from "../../../global_data";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumCutterVariants } from "shapez/game/buildings/cutter";
import { enumItemProcessorTypes } from "shapez/game/components/item_processor";
import { T } from "shapez/translations";
import { round1DigitLocalized } from "shapez/core/utils";

const enumCutterVariantsToProcessorTypes = {
    [defaultBuildingVariant]: enumItemProcessorTypes.cutter,
    [enumCutterVariants.quad]: enumItemProcessorTypes.cutterQuad,
};

export function classPatch({ $old }) {
    return {
        getIsUnlocked(root) {
            if (currentIngame.trapLocked.cutter) {
                return false;
            }
            if (!connection) {
                return $old.getIsUnlocked(root);
            }

            return (
                root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter) ||
                root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_quad)
            );
        },
        getAvailableVariants(root) {
            if (!connection) {
                return $old.getAvailableVariants(root);
            }

            const variants = [];
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter)) {
                variants.push(defaultBuildingVariant);
            }
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_quad)) {
                variants.push(enumCutterVariants.quad);
            }
            return variants;
        },
        getAdditionalStatistics(root, variant) {
            const beltSpeed = root.hubGoals.getBeltBaseSpeed();
            const buildingSpeed = root.hubGoals.getProcessorBaseSpeed(
                enumCutterVariantsToProcessorTypes[variant]
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
