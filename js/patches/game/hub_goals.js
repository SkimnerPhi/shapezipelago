import { connection, currentIngame } from "../../global_data";
import { checkLocation } from "../../server_communication";
import { enumItemProcessorTypes } from "shapez/game/components/item_processor";
import { apTry } from "../../utils";
import { getAPUpgradeLocationString } from "../../archipelago/ap_location";

export function classPatch({ $old }) {
    return {
        onGoalCompleted() {
            if (!connection) {
                return $old.onGoalCompleted();
            }

            apTry("Completing level failed", () => {
                this.root.app.gameAnalytics.handleLevelCompleted(this.level);
                if (this.level === 1) {
                    checkLocation("Checked", false, "Level 1", "Level 1 Additional");
                } else if (this.level === 20) {
                    checkLocation(
                        "Checked",
                        false,
                        "Level 20",
                        "Level 20 Additional",
                        "Level 20 Additional 2"
                    );
                } else {
                    checkLocation("Checked", false, "Level " + this.level);
                }
                if (connection.goal === "vanilla" || connection.goal === "mam") {
                    if (connection.levelsToGenerate <= this.level) {
                        checkLocation("Checked", true);
                    }
                }
                ++this.level;
                this.computeNextGoal();
                this.root.signals.storyGoalCompleted.dispatch(this.level - 1, this.currentGoal.reward);
            });
        },
        tryUnlockUpgrade(upgradeId) {
            if (!connection) {
                return $old.tryUnlockUpgrade(upgradeId);
            }

            return apTry("Unlocking upgrade failed", () => {
                const upgradeIdFixed = upgradeId.toString();
                if (!this.canUnlockUpgrade(upgradeId)) {
                    return false;
                }
                const upgradeTiers = this.root.gameMode.getUpgrades()[upgradeIdFixed];
                const currentLevel = this.getUpgradeLevel(upgradeId);
                const tierData = upgradeTiers[currentLevel];
                if (!tierData) {
                    return false;
                }
                for (let i = 0; i < tierData.required.length; ++i) {
                    const requirement = tierData.required[i];
                    this.storedShapes[requirement.shape] -= requirement.amount;
                }
                this.upgradeLevels[upgradeIdFixed] = (this.upgradeLevels[upgradeIdFixed] || 0) + 1;
                checkLocation("Checked", false, getAPUpgradeLocationString(upgradeId, currentLevel + 1));
                this.root.signals.upgradePurchased.dispatch(upgradeId);
                this.root.app.gameAnalytics.handleUpgradeUnlocked(upgradeId, currentLevel);
                return true;
            });
        },
        getBeltBaseSpeed() {
            return $old.getBeltBaseSpeed() * (currentIngame.trapThrottled.belt ? 0.5 : 1);
        },
        getUndergroundBeltBaseSpeed() {
            return $old.getUndergroundBeltBaseSpeed() * (currentIngame.trapThrottled.tunnel ? 0.5 : 1);
        },
        getMinerBaseSpeed() {
            return $old.getMinerBaseSpeed() * (currentIngame.trapThrottled.extractor ? 0.5 : 1);
        },
        getProcessorBaseSpeed(processorType) {
            const originalSpeed = $old.getProcessorBaseSpeed(processorType);
            switch (processorType) {
                case enumItemProcessorTypes.balancer:
                    return originalSpeed * (currentIngame.trapThrottled.balancer ? 0.5 : 1);
                case enumItemProcessorTypes.mixer:
                    return originalSpeed * (currentIngame.trapThrottled.mixer ? 0.5 : 1);
                case enumItemProcessorTypes.painter:
                case enumItemProcessorTypes.painterDouble:
                case enumItemProcessorTypes.painterQuad:
                    return originalSpeed * (currentIngame.trapThrottled.painter ? 0.5 : 1);
                case enumItemProcessorTypes.cutter:
                case enumItemProcessorTypes.cutterQuad:
                    return originalSpeed * (currentIngame.trapThrottled.cutter ? 0.5 : 1);
                case enumItemProcessorTypes.rotater:
                case enumItemProcessorTypes.rotaterCCW:
                case enumItemProcessorTypes.rotater180:
                    return originalSpeed * (currentIngame.trapThrottled.rotator ? 0.5 : 1);
                case enumItemProcessorTypes.stacker:
                    return originalSpeed * (currentIngame.trapThrottled.stacker ? 0.5 : 1);
                default:
                    return originalSpeed;
            }
        },
    };
}
