import { Mod } from "shapez/mods/mod";
import { addInputContainer } from "./ui_changes";
import { registerSavingData } from "./savefile";
import { GameRoot } from "shapez/game/root";
import { addCommands } from "./console_commands";
import { patchEnums, patchVanillaClasses } from "./patches/patches";
import { AchievementLocationProxy } from "./achievements";
import { checkLocation, resyncLocationChecks, shapesanityAnalyzer } from "./server_communication";
import { apDebugLog, apTry } from "./utils";
import { shapesanityExample } from "./shapesanity";
import { CLIENT_STATUS } from "archipelago.js";
import { HUDShapesanity } from "./hud/shapesanity";
import { BuildingTrapSystem } from "./systems/building_trap";
import { connection } from "./connection";
import { currentIngame, Ingame } from "./ingame";

/**
 * @type {Mod}
 */
export let modImpl;

class ModImpl extends Mod {
    init() {
        apTry("Mod initialization failed", () => {
            modImpl = this;
            patchVanillaClasses(this.modInterface);
            patchEnums();
            this.signals.gameInitialized.add(this.onGameInitialized);
            this.signals.gameStarted.add(this.onGameStarted);
            this.modInterface.registerHudElement("ingame_HUD_Shapesanity", HUDShapesanity);
            this.modInterface.registerGameSystem({
                id: "BuildingTrap",
                systemClass: BuildingTrapSystem,
                before: "end",
            });
            registerSavingData();
            addCommands();
            this.signals.gameInitialized.add((/** @type {GameRoot} */ root) => {
                addInputContainer(this);
                currentIngame.afterRootInitialization(root);
            });
            this.signals.stateEntered.add((state) => {
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

        apTry("Shapesanity button creation failed", () => {
            apDebugLog("Creating shapesanity button");
            const game_menu = root.hud.parts["gameMenu"];
            const shapesanityButton = document.createElement("button");
            shapesanityButton.classList.add("shapesanityButton");
            game_menu.element.prepend(shapesanityButton);
            game_menu.trackClicks(shapesanityButton, () =>
                root.hud.parts["ingame_HUD_Shapesanity"].show()
            );
        });
        connection.reportStatusToServer(CLIENT_STATUS.PLAYING);
        currentIngame.scoutedShapesanity = new Array(connection.shapesanityNames.length).fill(false);
        for (const name of connection.shapesanityNames) {
            const hash = shapesanityExample(name);
            currentIngame.shapesanityExamplesHash.push(hash);
            currentIngame.shapesanityExamples.push(
                root.shapeDefinitionMgr.getShapeFromShortKey(hash).generateAsCanvas(50)
            );
        }

        apTry("Requesting item package failed", () => connection.requestItemPackage());
        apTry("Resyncing locations failed", () => resyncLocationChecks(root));
    }
}
