import { gMetaBuildingRegistry } from "shapez/core/global_registries";
import { MetaHubBuilding } from "shapez/game/buildings/hub";
import { enumMinerVariants, MetaMinerBuilding } from "shapez/game/buildings/miner";
import { getBuildingDataFromCode } from "shapez/game/building_codes";
import { enumHubGoalRewards } from "shapez/game/tutorial_goals";

export function classPatch({ $old }) {
    return {
        startPipette() {
            if (this.root.camera.getIsMapOverlayActive()) {
                return;
            }
            const mousePosition = this.root.app.mousePosition;
            if (!mousePosition) {
                return;
            }
            const worldPos = this.root.camera.screenToWorld(mousePosition);
            const tile = worldPos.toTileSpace();
            const contents = this.root.map.getTileContent(tile, this.root.currentLayer);
            if (!contents) {
                const tileBelow = this.root.map.getLowerLayerContentXY(tile.x, tile.y);
                if (
                    tileBelow &&
                    this.root.app.settings.getAllSettings().pickMinerOnPatch &&
                    this.root.currentLayer === "regular" &&
                    this.root.gameMode.hasResources() &&
                    (this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_extractor) ||
                        this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_miner_chainable))
                ) {
                    this.currentMetaBuilding.set(gMetaBuildingRegistry.findByClass(MetaMinerBuilding));
                    if (this.root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_miner_chainable)) {
                        this.currentVariant.set(enumMinerVariants.chainable);
                    }
                } else {
                    this.currentMetaBuilding.set(null);
                }
                return;
            }
            const buildingCode = contents.components.StaticMapEntity.code;
            const extracted = getBuildingDataFromCode(buildingCode);
            if (extracted.metaInstance.getId() === gMetaBuildingRegistry.findByClass(MetaHubBuilding).getId()) {
                this.currentMetaBuilding.set(null);
                return;
            }
            if (this.root.gameMode.isBuildingExcluded(extracted.metaClass)) {
                this.currentMetaBuilding.set(null);
                return;
            }
            if (
                this.currentMetaBuilding.get() &&
                extracted.metaInstance.getId() === this.currentMetaBuilding.get().getId() &&
                extracted.variant === this.currentVariant.get()
            ) {
                this.currentMetaBuilding.set(null);
                return;
            }
            this.currentMetaBuilding.set(extracted.metaInstance);
            this.currentVariant.set(extracted.variant);
            this.currentBaseRotation = contents.components.StaticMapEntity.rotation;
        },
    };
}
