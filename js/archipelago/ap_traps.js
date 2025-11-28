import { enumHubGoalRewards } from "shapez/game/tutorial_goals";

export const enumTrapTypes = {
    trapLocked: "trapLocked",
    trapThrottled: "trapThrottled",
    trapMalfunction: "trapMalfunction",
};
export const enumTraps = {
    belt: "belt",
    balancer: "balancer",
    tunnel: "tunnel",
    extractor: "extractor",
    cutter: "cutter",
    cutter_quad: "cutter_quad",
    rotator: "rotator",
    stacker: "stacker",
    painter: "painter",
    painter_quad: "painter_quad",
    mixer: "mixer",
    trash: "trash",
};
export const enumTrapToHubGoalRewards = {
    [enumTraps.belt]: enumHubGoalRewards.reward_belt,
    [enumTraps.balancer]: enumHubGoalRewards.reward_balancer,
    [enumTraps.tunnel]: enumHubGoalRewards.reward_tunnel,
    [enumTraps.extractor]: enumHubGoalRewards.reward_miner,
    [enumTraps.cutter]: enumHubGoalRewards.reward_cutter,
    [enumTraps.cutter_quad]: enumHubGoalRewards.reward_cutter,
    [enumTraps.rotator]: enumHubGoalRewards.reward_rotater,
    [enumTraps.stacker]: enumHubGoalRewards.reward_stacker,
    [enumTraps.painter]: enumHubGoalRewards.reward_painter,
    [enumTraps.painter_quad]: enumHubGoalRewards.reward_painter_quad,
    [enumTraps.mixer]: enumHubGoalRewards.reward_mixer,
    [enumTraps.trash]: enumHubGoalRewards.reward_trash,
};
