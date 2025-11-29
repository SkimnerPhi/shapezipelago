import { BaseHUDPart } from "shapez/game/hud/base_hud_part";
import { makeButton, makeDiv, removeAllChildren } from "shapez/core/utils";
import { ClickDetector } from "shapez/core/click_detector";
import { ACHIEVEMENTS } from "shapez/platform/achievement_provider";
import { enumAchievementToAPLocations } from "../archipelago/ap_location";
import { T } from "shapez/translations";
import { DynamicDomAttach } from "shapez/game/hud/dynamic_dom_attach";
import { InputReceiver } from "shapez/core/input_receiver";
import { KeyActionMapper, KEYMAPPINGS } from "shapez/game/key_action_mapper";
import { translateShapesanity } from "../shapesanity";
import { connection } from "../connection";
import { currentIngame } from "../ingame";
import { logger } from "../main";

export class HUDShapesanity extends BaseHUDPart {
    createElements(parent) {
        this.background = makeDiv(parent, "ingame_HUD_Shapesanity", ["ingameDialog"]);

        this.dialogInner = makeDiv(this.background, null, ["dialogInner"]);
        this.title = makeDiv(this.dialogInner, null, ["title"], shapez.T.mods.shapezipelago.APBox.title);
        this.closeButton = makeDiv(this.title, null, ["closeButton"]);
        this.trackClicks(this.closeButton, this.close);

        this.tabs = makeDiv(this.dialogInner, null, ["tabs"]);
        this.tabButtonShapesanity = makeButton(
            this.tabs,
            ["tabsButtonShapesanity"],
            shapez.T.mods.shapezipelago.shapesanityBox.title
        );
        this.trackClicks(this.tabButtonShapesanity, this.setTabShapesanity);
        this.tabButtonSlotDetails = makeButton(
            this.tabs,
            ["tabButtonSlotDetails"],
            shapez.T.mods.shapezipelago.slotDetailsBox.title
        );
        this.trackClicks(this.tabButtonSlotDetails, this.setTabSlotDetails);
        this.tabButtonAchievements = makeButton(
            this.tabs,
            ["tabButtonAchievements"],
            shapez.T.mods.shapezipelago.achievementsBox.title
        );
        this.trackClicks(this.tabButtonAchievements, this.setTabAchievements);
        this.tabButtonTimeTrials = makeButton(
            this.tabs,
            ["tabButtonTimeTrials"],
            shapez.T.mods.shapezipelago.timeTrialsBox.title
        );
        this.trackClicks(this.tabButtonTimeTrials, this.setTabTimeTrials);
        this.tabButtonGiftShop = makeButton(
            this.tabs,
            ["tabButtonGiftShop"],
            shapez.T.mods.shapezipelago.giftShopBox.title
        );
        this.trackClicks(this.tabButtonGiftShop, this.setTabGiftShop);

        this.contentDiv = makeDiv(this.dialogInner, null, ["content"]);
        this.visible = false;
    }

    setTabShapesanity() {
        logger.debug("Showing shapesanity checklist");
        removeAllChildren(this.contentDiv);
        this.dialogInner.setAttribute("currentTab", "shapesanity");
        if (this.visible) {
            const currentGoalShape = this.root.hubGoals.currentGoal.definition.getHash();
            for (let index = 0; index < connection.shapesanityNames.length; ++index) {
                // Create div for every row
                const divElem = makeDiv(this.contentDiv, null, ["shapesanityRow"]);
                // Create name and translate it
                const nextName = document.createElement("span");
                nextName.classList.add("shapesanityName");
                nextName.innerText = `${index + 1}: ${translateShapesanity(
                    connection.shapesanityNames[index]
                )}`;
                // Mark already checked rows
                if (currentIngame.scoutedShapesanity[index]) {
                    divElem.classList.add("locationChecked");
                }
                // Append everything to div
                divElem.appendChild(nextName);
                divElem.appendChild(currentIngame.shapesanityExamples[index]);
                // Create pin button
                const pinButton = makeButton(divElem, ["pin"]);
                pinButton.classList.remove("styledButton");
                // Determine appearence and behavior of pin button
                if (currentIngame.shapesanityExamplesHash[index] === currentGoalShape) {
                    pinButton.classList.add("isGoal");
                } else if (
                    this.root.hud.parts["pinnedShapes"].isShapePinned(
                        currentIngame.shapesanityExamplesHash[index]
                    )
                ) {
                    pinButton.classList.add("alreadyPinned");
                }
                // Add listener to pin button
                const shapedef = this.root.shapeDefinitionMgr.getShapeFromShortKey(
                    currentIngame.shapesanityExamplesHash[index]
                );
                new ClickDetector(pinButton, { consumeEvents: true, preventDefault: true }).click.add(() => {
                    if (
                        this.root.hud.parts["pinnedShapes"].isShapePinned(
                            currentIngame.shapesanityExamplesHash[index]
                        )
                    ) {
                        this.root.hud.signals.shapeUnpinRequested.dispatch(
                            currentIngame.shapesanityExamplesHash[index]
                        );
                        pinButton.classList.add("unpinned");
                        pinButton.classList.remove("pinned", "alreadyPinned");
                    } else {
                        this.root.hud.signals.shapePinRequested.dispatch(shapedef);
                        pinButton.classList.add("pinned");
                        pinButton.classList.remove("unpinned");
                    }
                });
                // Create shape details button and add button listener
                const detailsButton = makeButton(divElem, ["showInfo"]);
                detailsButton.classList.remove("styledButton");
                new ClickDetector(detailsButton, { consumeEvents: true, preventDefault: true }).click.add(
                    () => {
                        this.root.hud.signals.viewShapeDetailsRequested.dispatch(shapedef);
                    }
                );
            }
        }
    }

    setTabSlotDetails() {
        logger.debug("Showing slot details");
        removeAllChildren(this.contentDiv);
        this.dialogInner.setAttribute("currentTab", "slotDetails");
        if (this.visible) {
            const detailsElem = document.createElement("span");
            detailsElem.innerHTML =
                shapez.T.mods.shapezipelago.slotDetailsBox.goal +
                ": " +
                connection.goal +
                "<br />" +
                shapez.T.mods.shapezipelago.slotDetailsBox.levelAmount +
                ": " +
                connection.levelsToGenerate.toString() +
                "<br />" +
                shapez.T.mods.shapezipelago.slotDetailsBox.upgradeAmount +
                ": " +
                connection.tiersToGenerate.toString() +
                "<br />" +
                shapez.T.mods.shapezipelago.slotDetailsBox.levelLogic +
                ": " +
                (connection.isRandomizedLevels
                    ? connection.levelsLogic
                    : shapez.T.mods.shapezipelago.slotDetailsBox.notRandomized) +
                "<br />" +
                shapez.T.mods.shapezipelago.slotDetailsBox.upgradeLogic +
                ": " +
                (connection.isRandomizedUpgrades
                    ? connection.upgradesLogic
                    : shapez.T.mods.shapezipelago.slotDetailsBox.notRandomized) +
                "<br />" +
                shapez.T.mods.shapezipelago.slotDetailsBox.seed +
                ": " +
                connection.clientSeed.toString() +
                "<br />" +
                shapez.T.mods.shapezipelago.slotDetailsBox.floatingLayers +
                ": " +
                connection.isFloatingLayersAllowed +
                "<br />" +
                shapez.T.mods.shapezipelago.slotDetailsBox.shop +
                ": " +
                shapez.T.mods.shapezipelago.slotDetailsBox.shopNone;
            this.contentDiv.appendChild(detailsElem);
            const clearCanvasButton = makeButton(
                this.contentDiv,
                [],
                shapez.T.mods.shapezipelago.slotDetailsBox.clearCanvasButton
            );
            clearCanvasButton.addEventListener("click", () => {
                this.root.logic.clearAllBeltsAndItems();
            });
        }
    }

    setTabAchievements() {
        logger.debug("Showing achievements checklist");
        removeAllChildren(this.contentDiv);
        this.dialogInner.setAttribute("currentTab", "achievements");
        if (this.visible) {
            if (this.achievementsIncluded) {
                for (const achievement in ACHIEVEMENTS) {
                    let availability = 0;
                    const location = enumAchievementToAPLocations[achievement];
                    const id = connection.gamepackage.location_name_to_id[location];
                    if (connection.client.locations.missing.includes(id)) {
                        availability = 1;
                    }
                    if (connection.client.locations.checked.includes(id)) {
                        availability = 2;
                    }

                    if (availability) {
                        const divElem = makeDiv(this.contentDiv, null, ["shapesanityRow"]);
                        const nextName = document.createElement("span");
                        nextName.classList.add("achievementName");
                        nextName.innerText = T.achievements[achievement];
                        if (availability === 2) {
                            divElem.classList.add("locationChecked");
                        }
                        divElem.appendChild(nextName);
                    }
                }
            } else {
                const placeholder = document.createElement("span", {});
                placeholder.innerText = shapez.T.mods.shapezipelago.achievementsBox.disabled;
                this.contentDiv.appendChild(placeholder);
            }
        }
    }

    setTabTimeTrials() {
        logger.debug("Showing time trials overview");
        removeAllChildren(this.contentDiv);
        this.dialogInner.setAttribute("currentTab", "timeTrials");
        if (this.visible) {
            const placeholder = document.createElement("span", {});
            placeholder.classList.add("comingSoonPlaceholder");
            placeholder.innerText = "Coming Soon™";
            this.contentDiv.appendChild(placeholder);
        }
    }

    setTabGiftShop() {
        logger.debug("Showing gift shop overview");
        removeAllChildren(this.contentDiv);
        this.dialogInner.setAttribute("currentTab", "giftShop");
        if (this.visible) {
            const placeholder = document.createElement("span", {});
            placeholder.classList.add("comingSoonPlaceholder");
            placeholder.innerText = "Coming Soon™";
            this.contentDiv.appendChild(placeholder);
        }
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });
        this.inputReciever = new InputReceiver("shapesanity");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);
        this.keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.close, this);
        this.keyActionMapper.getBinding(KEYMAPPINGS.ingame.menuClose).add(this.close, this);
        this.lastFullRerender = 0;
        this.close();
    }

    scout() {
        for (const checked of connection.getCheckedLocationNames()) {
            if (checked.startsWith("Shapesanity")) {
                currentIngame.scoutedShapesanity[Number(checked.split(" ")[1]) - 1] = true;
            }
        }
    }

    show() {
        logger.debug("Showing AP hud");
        this.visible = true;
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        if (connection) {
            this.scout();
        }
        this.update();
        this.setTabShapesanity();
        const exampleId = connection.gamepackage.location_name_to_id[ACHIEVEMENTS.cutShape];
        this.achievementsIncluded =
            connection.client.locations.missing.includes(exampleId) ||
            connection.client.locations.checked.includes(exampleId);
    }

    close() {
        this.visible = false;
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.update();
    }

    update() {
        this.domAttach.update(this.visible);
    }

    isBlockingOverlay() {
        return this.visible;
    }
}
