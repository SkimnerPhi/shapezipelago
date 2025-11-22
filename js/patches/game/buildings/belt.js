import { connection, customRewards } from "../../../global_data";

export function classPatch({ $old }) {
    return {
        getIsUnlocked(root) {
            if (!connection) {
                return $old.getIsUnlocked(root);
            }

            return root.hubGoals.isRewardUnlocked(customRewards.belt);
        },
    };
}
