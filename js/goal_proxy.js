import { globalConfig } from "shapez/core/config";
import { connection } from "./connection";
import { enumAnalyticsDataSource } from "shapez/game/production_analytics";
import { currentIngame } from "./ingame";
import { checkLocation } from "./server_communication";

const efficiency3TargetRate = 256;

export class GoalProxy {
    constructor(root) {
        this.root = root;
        this.sliceTime = 0;
    }

    startSlice() {
        this.sliceTime = this.root.time.now();

        const currentRateRaw = this.root.productionAnalytics.getCurrentShapeRateRaw(
            enumAnalyticsDataSource.delivered,
            currentIngame.root.shapeDefinitionMgr.getShapeFromShortKey(connection.blueprintShape)
        );
        if (currentRateRaw / globalConfig.analyticsSliceDurationSeconds >= efficiency3TargetRate) {
            checkLocation("Checked", true);
        }
    }

    update() {
        if (connection.goal !== "efficiency_iii") {
            return;
        }

        if (this.root.time.now() - this.sliceTime > globalConfig.achievementSliceDuration) {
            this.startSlice();
        }
    }
}
