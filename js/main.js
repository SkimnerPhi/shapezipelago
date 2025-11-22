import { Mod } from "shapez/mods/mod";
import { addInputContainer, addShapesanityBox } from "./ui_changes";
import { registerSavingData } from "./savefile";
import { connection, currentIngame, Ingame, setModImpl } from "./global_data";
import { GameRoot } from "shapez/game/root";
import { addCommands } from "./console_commands";
import { patchEnums, patchVanillaClasses } from "./patches/patches";
import { AchievementLocationProxy } from "./achievements";
import { checkLocation, resyncLocationChecks, shapesanityAnalyzer } from "./server_communication";
import { enumAnalyticsDataSource } from "shapez/game/production_analytics";
import { globalConfig } from "shapez/core/config";
import { apDebugLog, apTry } from "./utils";

class ModImpl extends Mod {
    init() {
        apTry("Mod initialization failed", () => {
            setModImpl(this);
            patchVanillaClasses(this.modInterface);
            patchEnums();
            this.signals.gameInitialized.add(this.onGameInitialized);
            this.signals.gameStarted.add(this.onGameStarted);
            addInputContainer();
            addShapesanityBox();
            registerSavingData();
            addCommands();
            this.signals.gameInitialized.add((/** @type {GameRoot} */ root) => {
                currentIngame.afterRootInitialization(root);
            });
            this.signals.stateEntered.add(state => {
                apTry("Ingame (de)contruction failed", () => {
                    if (state.key === "InGameState") {
                        new Ingame();
                    } else {
                        if (currentIngame) {
                            currentIngame.leave();
                            if (state.key === "MainMenuState") {
                                connection?.disconnect();
                            }
                        }
                    }
                });
            });
        });
    }

    onGameInitialized(root) {
        apTry("AchievementProxy contruction failed", () => {
            root.achievementProxy = new AchievementLocationProxy(root);
        });
    }
    onGameStarted(root) {
        if (!connection) {
            return;
        }

        apDebugLog("I need to restructure these signals.gameStarted things...");
        root.signals.shapeDelivered.add(shapesanityAnalyzer);
        root.signals.upgradePurchased.add(function () {
            apTry("Testing even_fasterer goal failed", () => {
                if (connection.goal === "even_fasterer") {
                    // upgrade levels start at 0, because it is used for index of upgrade definitions
                    if (
                        root.hubGoals.getUpgradeLevel("belt") + 1 >= connection.tiersToGenerate &&
                        root.hubGoals.getUpgradeLevel("miner") + 1 >= connection.tiersToGenerate &&
                        root.hubGoals.getUpgradeLevel("processors") + 1 >= connection.tiersToGenerate &&
                        root.hubGoals.getUpgradeLevel("painting") + 1 >= connection.tiersToGenerate
                    ) {
                        checkLocation("Checked", true);
                    }
                }
            });
        });
        apTry("Requesting item package failed", () => connection.requestItemPackage());
        apTry("Resyncing locations failed", resyncLocationChecks);
        if (connection.goal === "efficiency_iii") {
            currentIngame.startEfficiency3Interval(() => {
                apTry("Efficiency III failed", () => {
                    const currentRateRaw = currentIngame.root.productionAnalytics.getCurrentShapeRateRaw(
                        enumAnalyticsDataSource.delivered,
                        currentIngame.root.shapeDefinitionMgr.getShapeFromShortKey(connection.blueprintShape)
                    );
                    if (currentRateRaw / globalConfig["analyticsSliceDurationSeconds"] >= 256) {
                        checkLocation("Checked", true);
                    }
                });
            }, 5000);
        }
    }
}
