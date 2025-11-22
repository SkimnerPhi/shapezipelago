import { GameCore } from "shapez/game/core";
import { HubGoals } from "shapez/game/hub_goals";
import { ShapeDefinitionManager } from "shapez/game/shape_definition_manager";
import { MetaBalancerBuilding } from "shapez/game/buildings/balancer";
import { MetaBeltBuilding } from "shapez/game/buildings/belt";
import { MetaCutterBuilding } from "shapez/game/buildings/cutter";
import { MetaLeverBuilding } from "shapez/game/buildings/lever";
import { MetaMinerBuilding } from "shapez/game/buildings/miner";
import { MetaMixerBuilding } from "shapez/game/buildings/mixer";
import { MetaPainterBuilding } from "shapez/game/buildings/painter";
import { MetaRotaterBuilding } from "shapez/game/buildings/rotater";
import { MetaStackerBuilding } from "shapez/game/buildings/stacker";
import { MetaTrashBuilding } from "shapez/game/buildings/trash";
import { MetaUndergroundBeltBuilding } from "shapez/game/buildings/underground_belt";
import { MetaWireBuilding } from "shapez/game/buildings/wire";
import { MetaWireTunnelBuilding } from "shapez/game/buildings/wire_tunnel";
import { HUDBaseToolbar } from "shapez/game/hud/parts/base_toolbar";
import { HUDBuildingPlacerLogic } from "shapez/game/hud/parts/building_placer_logic";
import { HUDShop } from "shapez/game/hud/parts/shop";
import { HUDWiresOverlay } from "shapez/game/hud/parts/wires_overlay";
import { RegularGameMode } from "shapez/game/modes/regular";
import { InGameState } from "shapez/states/ingame";

import { classPatch as gameCorePatch } from "./game/core";
import { classPatch as hubGoalsPatch } from "./game/hub_goals";
import { classPatch as shapeDefinitionManagerPatch } from "./game/shape_definition_manager";
import { classPatch as balancerPatch } from "./game/buildings/balancer";
import { classPatch as beltPatch } from "./game/buildings/belt";
import { classPatch as cutterPatch } from "./game/buildings/cutter";
import { classPatch as leverPatch } from "./game/buildings/lever";
import { classPatch as minerPatch } from "./game/buildings/miner";
import { classPatch as mixerPatch } from "./game/buildings/mixer";
import { classPatch as painterPatch } from "./game/buildings/painter";
import { classPatch as rotaterPatch } from "./game/buildings/rotater";
import { classPatch as stackerPatch } from "./game/buildings/stacker";
import { classPatch as trashPatch } from "./game/buildings/trash";
import { classPatch as undergroundBeltPatch } from "./game/buildings/underground_belt";
import { classPatch as wirePatch } from "./game/buildings/wire";
import { classPatch as wireTunnelPatch } from "./game/buildings/wire_tunnel";
import { classPatch as hudBaseToolbarPatch } from "./game/hud/parts/base_toolbar";
import { classPatch as hudBuildingPlacerLogicPatch } from "./game/hud/parts/building_placer_logic";
import { classPatch as hudShopPatch } from "./game/hud/parts/shop";
import { classPatch as hudWiresOverlayPatch } from "./game/hud/parts/wires_overlay";
import { classPatch as regularGameModePatch } from "./game/modes/regular";
import { classPatch as inGameStatePatch } from "./states/ingame";

export function patchVanillaClasses(modInterface) {
    // game/
    modInterface.extendClass(GameCore, gameCorePatch);
    modInterface.extendClass(HubGoals, hubGoalsPatch);
    modInterface.extendClass(ShapeDefinitionManager, shapeDefinitionManagerPatch);

    // game/buildings/
    modInterface.extendClass(MetaBalancerBuilding, balancerPatch);
    modInterface.extendClass(MetaBeltBuilding, beltPatch);
    modInterface.extendClass(MetaCutterBuilding, cutterPatch);
    modInterface.extendClass(MetaLeverBuilding, leverPatch);
    modInterface.extendClass(MetaMinerBuilding, minerPatch);
    modInterface.extendClass(MetaMixerBuilding, mixerPatch);
    modInterface.extendClass(MetaPainterBuilding, painterPatch);
    modInterface.extendClass(MetaRotaterBuilding, rotaterPatch);
    modInterface.extendClass(MetaStackerBuilding, stackerPatch);
    modInterface.extendClass(MetaTrashBuilding, trashPatch);
    modInterface.extendClass(MetaUndergroundBeltBuilding, undergroundBeltPatch);
    modInterface.extendClass(MetaWireBuilding, wirePatch);
    modInterface.extendClass(MetaWireTunnelBuilding, wireTunnelPatch);

    // game/hud/parts/
    modInterface.extendClass(HUDBaseToolbar, hudBaseToolbarPatch);
    modInterface.extendClass(HUDBuildingPlacerLogic, hudBuildingPlacerLogicPatch);
    modInterface.extendClass(HUDShop, hudShopPatch);
    modInterface.extendClass(HUDWiresOverlay, hudWiresOverlayPatch);

    // game/modes/
    modInterface.extendClass(RegularGameMode, regularGameModePatch);

    // states/
    modInterface.extendClass(InGameState, inGameStatePatch);
}
