import {ACTION_TYPE} from "core/battlegrid/creatures/ActionType";
import type {IRInstruction, IRPower} from "core/types";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";

export const POWER_EDITOR_TEMPLATE = {
    MOVE: "move",
    SHIFT: "shift",
    MELEE_BASIC_ATTACK: "melee_basic_attack",
    OPPORTUNITY_ATTACK: "opportunity_attack",
    BLANK: "blank",
} as const

export type PowerEditorTemplate = typeof POWER_EDITOR_TEMPLATE[keyof typeof POWER_EDITOR_TEMPLATE]

export const create_default_instruction = (type: IRInstruction["type"]): IRInstruction => {
    switch (type) {
        case INSTRUCTION_TYPE.APPLY_DAMAGE:
            return {type, value: "$add({1W},owner.str_mod)", target: "primary_target"}
        case INSTRUCTION_TYPE.MOVE:
        case INSTRUCTION_TYPE.SHIFT:
            return {type, target: "owner", destination: "primary_target"}
        case INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS:
            return {type, creature: "owner", cost: "opportunity", filter: "melee_basic_attack"}
        default:
            return {type: INSTRUCTION_TYPE.APPLY_DAMAGE, value: "1", target: "primary_target"}
    }
}

export const create_default_power = (template: PowerEditorTemplate = POWER_EDITOR_TEMPLATE.MOVE): IRPower => {
    switch (template) {
        case POWER_EDITOR_TEMPLATE.SHIFT:
            return {
                name: "Shift",
                type: {action: ACTION_TYPE.MOVEMENT, cooldown: "at-will", attack: false},
                targeting: {targeting_type: "movement", distance: 1},
                effect: [create_default_instruction(INSTRUCTION_TYPE.SHIFT)],
            }
        case POWER_EDITOR_TEMPLATE.MELEE_BASIC_ATTACK:
            return {
                name: "Melee Basic Attack",
                type: {
                    action: ACTION_TYPE.STANDARD,
                    cooldown: "at-will",
                    attack: true,
                    traits: ["melee_basic_attack"],
                },
                targeting: {targeting_type: "melee_weapon", target_type: "enemy", amount: 1},
                roll: {
                    attack: "str",
                    defense: "ac",
                    hit: [create_default_instruction(INSTRUCTION_TYPE.APPLY_DAMAGE)],
                },
            }
        case POWER_EDITOR_TEMPLATE.OPPORTUNITY_ATTACK:
            return {
                name: "Opportunity Attack",
                type: {action: ACTION_TYPE.OPPORTUNITY, cooldown: "at-will", attack: true},
                trigger: {
                    type: "reaction",
                    intercepts: ["movement"],
                    conditions: [
                        `$is_lower_or_equal($distance(trigger_activator,trigger_owner),$opportunity_attack_range(trigger_owner))`,
                        `$are_enemies(trigger_activator,trigger_owner)`,
                    ],
                },
                effect: [create_default_instruction(INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS)],
            }
        case POWER_EDITOR_TEMPLATE.BLANK:
            return {
                name: "New Power",
                type: {action: ACTION_TYPE.STANDARD, cooldown: "at-will", attack: false},
            }
        case POWER_EDITOR_TEMPLATE.MOVE:
        default:
            return {
                name: "Move",
                type: {action: ACTION_TYPE.MOVEMENT, cooldown: "at-will", attack: false},
                targeting: {targeting_type: "movement", distance: "owner.movement"},
                effect: [create_default_instruction(INSTRUCTION_TYPE.MOVE)],
            }
    }
}
