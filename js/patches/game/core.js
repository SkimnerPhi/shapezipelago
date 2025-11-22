import { connection } from "../../global_data";
import { randomInt } from "shapez/core/utils";
import { gMetaBuildingRegistry } from "shapez/core/global_registries";
import { MetaHubBuilding } from "shapez/game/buildings/hub";
import { Vector } from "shapez/core/vector";
import { defaultBuildingVariant } from "shapez/game/meta_building";
import { globalConfig } from "shapez/core/config";
import { apDebugLog, apTry } from "../../utils";

export function classPatch({ $old }) {
    return {
        initNewGame() {
            apTry("Game initialization failed", () => {
                apDebugLog("Initializing new AP game");
                this.root.gameIsFresh = true;
                if (connection) {
                    this.root.map.seed = connection.clientSeed;
                } else {
                    this.root.map.seed = randomInt(0, 100000);
                }
                if (!this.root.gameMode.hasHub()) {
                    return;
                }
                // Place the hub
                const hub = gMetaBuildingRegistry.findByClass(MetaHubBuilding).createEntity({
                    root: this.root,
                    origin: new Vector(-2, -2),
                    rotation: 0,
                    originalRotation: 0,
                    rotationVariant: 0,
                    variant: defaultBuildingVariant,
                });
                this.root.map.placeStaticEntity(hub);
                this.root.entityMgr.registerEntity(hub);
                this.root.camera.center = new Vector(-5, 2).multiplyScalar(globalConfig.tileSize);
            });
        },
    };
}
