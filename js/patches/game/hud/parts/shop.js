import { currentIngame } from "../../../../global_data";

export function classPatch({ $old }) {
    return {
        initialize() {
            $old.initialize();
            // Register the rerendering of the shop to item receiving signal, so that it immediately updates upon receiving an upgrade item
            currentIngame.itemReceiveSignal.add(this.rerenderFull, this);
        },
    };
}
