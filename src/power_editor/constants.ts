import {ACTION_TYPE} from "core/battlegrid/creatures/ActionType";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";

export const ACTION_TYPES = Object.values(ACTION_TYPE);
export const COOLDOWNS = ["at-will", "encounter", "daily"] as const;
export const POWER_KEYWORDS = ["Invigorating", "Martial", "Weapon"] as const;
export const POWER_TRAITS = ["melee_basic_attack"] as const;
export const DEFENSES = ["ac", "fortitude", "reflex", "will"] as const;
export const TARGETING_TYPES = ["adjacent", "melee_weapon", "movement", "ranged", "area_burst"] as const;
export const MELEE_TARGET_TYPES = ["enemy", "creature"] as const;
export const RANGED_TARGET_TYPES = ["terrain", "enemy", "creature"] as const;
export const TRIGGER_TYPES = ["interruption", "reaction"] as const;
export const INTERCEPTS = ["movement", "critical_hit"] as const;
export const STATUS_DURATION_VALUES = [
    "until_start_of_your_next_turn",
    "until_end_of_your_next_turn",
    "until_start_of_next_turn",
    "until_your_next_attack_roll_against_target",
] as const;
export const STATUS_TYPES = ["grant_combat_advantage", "gain_resistance", "gain_attack_bonus"] as const;
export const ADD_POWERS_COSTS = ["normal", "opportunity", "free_attack"] as const;
export const ADD_POWERS_FILTERS = ["turn", "melee_basic_attack"] as const;

export const INSTRUCTION_TYPES = [
    INSTRUCTION_TYPE.APPLY_DAMAGE,
    INSTRUCTION_TYPE.SELECT_TARGET,
    INSTRUCTION_TYPE.MOVE,
    INSTRUCTION_TYPE.SHIFT,
    INSTRUCTION_TYPE.CONDITION,
    INSTRUCTION_TYPE.OPTIONS,
    INSTRUCTION_TYPE.SAVE_VARIABLE,
    INSTRUCTION_TYPE.SAVE_NUMBER_AS_RESOLVED,
    INSTRUCTION_TYPE.APPLY_STATUS,
    INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS,
    "push",
] as const;

export type InstructionTypeOption = typeof INSTRUCTION_TYPES[number];
