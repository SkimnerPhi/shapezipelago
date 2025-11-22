import { currentIngame } from "../../global_data";
import { ACHIEVEMENTS } from "shapez/platform/achievement_provider";
import { ShapeDefinition } from "shapez/game/shape_definition";

export function classPatch({ $old }) {
    return {
        shapeActionCutHalf(definition) {
            if (!currentIngame.trapMalfunction.cutter) {
                return $old.shapeActionCutHalf(definition);
            }
            const key = "cut-mal/" + definition.getHash();
            if (this.operationCache[key]) {
                return /** @type {[ShapeDefinition, ShapeDefinition]} */ (this.operationCache[key]);
            }
            const rightSide = definition.cloneFilteredByQuadrants([3, 0]);
            const leftSide = definition.cloneFilteredByQuadrants([1, 2]);
            this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.cutShape, null);
            return /** @type {[ShapeDefinition, ShapeDefinition]} */ (
                this.operationCache[key] = [
                    this.registerOrReturnHandle(rightSide),
                    this.registerOrReturnHandle(leftSide),
                ]
            );
        },
        shapeActionCutQuad(definition) {
            if (!currentIngame.trapMalfunction.cutter_quad) {
                return $old.shapeActionCutQuad(definition);
            }
            const key = "cut-quad-mal/" + definition.getHash();
            if (this.operationCache[key]) {
                return /** @type {[ShapeDefinition, ShapeDefinition, ShapeDefinition, ShapeDefinition]} */ (
                    this.operationCache[key]
                );
            }
            const rotated = definition.cloneRotateCW();
            return /** @type {[ShapeDefinition, ShapeDefinition, ShapeDefinition, ShapeDefinition]} */ (
                this.operationCache[key] = [
                    this.registerOrReturnHandle(rotated.cloneFilteredByQuadrants([2])),
                    this.registerOrReturnHandle(rotated.cloneFilteredByQuadrants([0])),
                    this.registerOrReturnHandle(rotated.cloneFilteredByQuadrants([1])),
                    this.registerOrReturnHandle(rotated.cloneFilteredByQuadrants([3])),
                ]
            );
        },
        shapeActionRotateCW(definition) {
            if (!currentIngame.trapMalfunction.rotator) {
                return $old.shapeActionRotateCW(definition);
            }
            const key = "rotate-ccw/" + definition.getHash();
            if (this.operationCache[key]) {
                return /** @type {ShapeDefinition} */ (this.operationCache[key]);
            }
            const rotated = definition.cloneRotateCCW();
            this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.rotateShape, null);
            return /** @type {ShapeDefinition} */ (
                this.operationCache[key] = this.registerOrReturnHandle(rotated)
            );
        },
        shapeActionRotateCCW(definition) {
            if (!currentIngame.trapMalfunction.rotator_ccw) {
                return $old.shapeActionRotateCCW(definition);
            }
            const key = "rotate-fl/" + definition.getHash();
            if (this.operationCache[key]) {
                return /** @type {ShapeDefinition} */ (this.operationCache[key]);
            }
            const rotated = definition.cloneRotate180();
            return /** @type {ShapeDefinition} */ (
                this.operationCache[key] = this.registerOrReturnHandle(rotated)
            );
        },
        shapeActionRotate180(definition) {
            if (!currentIngame.trapMalfunction.rotator_180) {
                return $old.shapeActionRotate180(definition);
            }
            const key = "rotate-cw/" + definition.getHash();
            if (this.operationCache[key]) {
                return /** @type {ShapeDefinition} */ (this.operationCache[key]);
            }
            const rotated = definition.cloneRotateCW();
            return /** @type {ShapeDefinition} */ (
                this.operationCache[key] = this.registerOrReturnHandle(rotated)
            );
        },
        shapeActionStack(lowerDefinition, upperDefinition) {
            if (!currentIngame.trapMalfunction.stacker) {
                return $old.shapeActionStack(lowerDefinition, upperDefinition);
            } else {
                return $old.shapeActionStack(upperDefinition, lowerDefinition);
            }
        },
        shapeActionPaintWith(definition, color) {
            if (!currentIngame.trapMalfunction.painter) {
                return $old.shapeActionPaintWith(definition, color);
            }
            const key = "paint-mal/" + definition.getHash() + "/" + color;
            if (this.operationCache[key]) {
                return /** @type {ShapeDefinition} */ (this.operationCache[key]);
            }
            this.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.paintShape, null);
            const randomizedColors = [
                Math.random() < 0.75 ? color : null,
                Math.random() < 0.75 ? color : null,
                Math.random() < 0.75 ? color : null,
                Math.random() < 0.75 ? color : null,
            ];
            // @ts-ignore
            const colorized = definition.cloneAndPaintWith4Colors(randomizedColors);
            return /** @type {ShapeDefinition} */ (
                this.operationCache[key] = this.registerOrReturnHandle(colorized)
            );
        },
        shapeActionPaintWith4Colors(definition, colors) {
            if (!currentIngame.trapMalfunction.painter_quad) {
                return $old.shapeActionPaintWith4Colors(definition, colors);
            }
            const randomizedColors = [
                colors[Math.floor(Math.random() * 4)],
                colors[Math.floor(Math.random() * 4)],
                colors[Math.floor(Math.random() * 4)],
                colors[Math.floor(Math.random() * 4)],
            ];
            const key = "paint4/" + definition.getHash() + "/" + randomizedColors.join(",");
            if (this.operationCache[key]) {
                return /** @type {ShapeDefinition} */ (this.operationCache[key]);
            }
            // @ts-ignore
            const colorized = definition.cloneAndPaintWith4Colors(randomizedColors);
            return /** @type {ShapeDefinition} */ (
                this.operationCache[key] = this.registerOrReturnHandle(colorized)
            );
        },
    };
}
