import { currentIngame } from "../../../global_data";

export function classPatch({ $old }) {
    return {
        getIsUnlocked(root) {
            if (currentIngame.trapLocked.trash) {
                return false;
            }

            return $old.getIsUnlocked(root);
        },
    };
}
