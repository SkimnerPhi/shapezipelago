import { enumHubGoalRewards } from "shapez/game/tutorial_goals";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { enumPainterVariants } from "shapez/game/buildings/painter";
import { T } from "shapez/translations";
import { round1DigitLocalized } from "shapez/core/utils";
import { enumItemProcessorTypes } from "shapez/game/components/item_processor";
import { connection } from "../../../connection";
import { currentIngame } from "../../../ingame";

const enumPainterVariantsToProcessorTypes = {
    [defaultBuildingVariant]: enumItemProcessorTypes.painter,
    [enumPainterVariants.double]: enumItemProcessorTypes.painterDouble,
    [enumPainterVariants.quad]: enumItemProcessorTypes.painterQuad,
};

export function classPatch({ $old }) {
    return {
        getIsUnlocked(root) {
            if (currentIngame.trapLocked.painter) {
                return false;
            }
            if (!connection) {
                return $old.getIsUnlocked(root);
            }

            return (
                $old.getIsUnlocked(root) ||
                root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_painter_double) ||
                root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_painter_quad)
            );
        },
        getAvailableVariants(root) {
            if (!connection) {
                return $old.getAvailableVariants(root);
            }

            const variants = [];
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_painter)) {
                variants.push(defaultBuildingVariant, enumPainterVariants.mirrored);
            }
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_painter_double)) {
                variants.push(enumPainterVariants.double);
            }
            if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_painter_quad)) {
                variants.push(enumPainterVariants.quad);
            }
            return variants;
        },
        getAdditionalStatistics(root, variant) {
            const beltSpeed = root.hubGoals.getBeltBaseSpeed();
            const buildingSpeed = root.hubGoals.getProcessorBaseSpeed(
                enumPainterVariantsToProcessorTypes[variant]
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
