import {ATTACK_ROLL_RESOLUTION_MODE, type AttackRollResolutionMode} from "core/settings/AttackRollResolutionMode";

export const create_settings = (): { attack_roll_resolution: AttackRollResolutionMode } => ({
    attack_roll_resolution: ATTACK_ROLL_RESOLUTION_MODE.RIGGED_ROLL,
})

export type Settings = ReturnType<typeof create_settings>;