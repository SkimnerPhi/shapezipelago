import { GameRoot } from "shapez/game/root";
import { processItemsPacket } from "./server_communication";
import { apDebugLog } from "./utils";
import { connection, Connection } from "./connection";
import { currentIngame } from "./ingame";
import { modImpl } from "./main";

export function registerSavingData() {
    apDebugLog("Calling registerSavingData");
    modImpl.signals.gameSerialized.add((/** @type {GameRoot} */ root, savegame) => {
        if (connection) {
            // Connection is established, use always-present connection.connectionInformation
            savegame.modExtraData["connectInfo"] = connection.connectionInformation;
        } else if (currentIngame.connectionInformation) {
            // Connecting from stored info probably failed, use info from currentIngame to not loose it
            savegame.modExtraData["connectInfo"] = currentIngame.connectionInformation;
        } else {
            // No connection planned for this save, so do not save anything
            return;
        }
        savegame.modExtraData["processedItemCount"] = currentIngame.processedItemCount;
        apDebugLog("Serialized with processed item count " + currentIngame.processedItemCount);
    });
    modImpl.signals.gameDeserialized.add((/**@type GameRoot */ root, savegame) => {
        const lateInitializations = () => {
            for (const entry in currentIngame.lateToolbarInitializations) {
                currentIngame.lateToolbarInitializations[entry]();
            }
        };
        if (connection) {
            currentIngame.processedItemCount = savegame.modExtraData["processedItemCount"] || 0;
            apDebugLog("Deserialized with processed item count " + currentIngame.processedItemCount);
            lateInitializations();
        } else {
            if (savegame.modExtraData["connectInfo"]) {
                currentIngame.isTryingToConnect = true;
                currentIngame.processedItemCount = savegame.modExtraData["processedItemCount"] || 0;
                currentIngame.connectionInformation = savegame.modExtraData["connectInfo"];
                apDebugLog("Deserialized with processed item count " + currentIngame.processedItemCount);
                new Connection()
                    .tryConnect(savegame.modExtraData["connectInfo"], (packet) =>
                        processItemsPacket(root, packet)
                    )
                    .finally(function () {
                        // Resuming InGame stages
                        apDebugLog("Redeserializing data");
                        root.map.deserialize(savegame.map);
                        root.gameMode.deserialize(savegame.gameMode);
                        root.hubGoals.deserialize(savegame.hubGoals, root);
                        lateInitializations();
                        apDebugLog("Switching to stage 5 after trying to connect");
                        root.app.gameAnalytics.handleGameResumed();
                        root.gameState.stage5FirstUpdate();
                    });
            } else {
                lateInitializations();
            }
        }
    });
}
