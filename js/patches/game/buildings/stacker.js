import { T } from "shapez/translations";
import { round1DigitLocalized } from "shapez/core/utils";
import { enumItemProcessorTypes } from "shapez/game/components/item_processor";
import { currentIngame } from "../../../ingame";

export function classPatch({ $old }) {
    return {
        getIsUnlocked(root) {
            if (currentIngame.trapLocked.painter) {
                return false;
            }

            return $old.getIsUnlocked(root);
        },
        getAdditionalStatistics(root, variant) {
            const beltSpeed = root.hubGoals.getBeltBaseSpeed();
            const buildingSpeed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.stacker);

            const stats = $old.getAdditionalStatistics(root, variant);
            stats.push([
                T.mods.shapezipelago.statisticsBox.perBelt,
                round1DigitLocalized(beltSpeed / buildingSpeed),
            ]);
            return stats;
        },
    };
}
