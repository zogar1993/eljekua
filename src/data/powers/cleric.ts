import {IR_INSTRUCTION_TYPE, IRPower} from "core/types";
import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";

const cause_fear: IRPower = {
    name: "Cause Fear",
    class: "Cleric",
    level: 1,
    description: "Your holy symbol ignites with the fury of your god. Uncontrollable terror grips your enemy, causing it to instantly recoil.",
    keywords: ["Divine", "Fear", "Implement"],
    type: {
        action: "standard",
        cooldown: "encounter",
        attack: true,
    },
    targeting: {
        targeting_type: "ranged",
        target_type: "creature",
        amount: 1,
        distance: "10",
    },
    roll: {
        attack: "wis",
        defense: "will",
        hit: [
            {
                type: INSTRUCTION_TYPE.SAVE_VARIABLE,
                label: "cause_fear__forced_movement",
                power: {
                    name: "Flee",
                    type: {
                        action: "free",
                    },
                    targeting: {
                        targeting_type: "movement",
                        distance: '$add($movement(owner), $attr_mod(attacker, "cha"))',
                        destination_requirement: "$let($max($map(targets, x, $distance(x, attacker))), max_distance, $filter(targets, y, $equals($distance(y, attacker), max_distance)))",
                    },
                    effect: [
                        {
                            type: INSTRUCTION_TYPE.WALK,
                            target_label: "owner",
                            destination_label: "primary_target",
                        }
                    ],
                },
            },
            {
                type: INSTRUCTION_TYPE.EXECUTE_POWER,
                power_label: "cause_fear__forced_movement",
                initialization: [
                    {from_label: "primary_target", to_label: "owner"},
                    {from_label: "owner", to_label: "attacker"},
                ],
            }
        ],
    },
}

const lance_of_faith: IRPower = {
    name: "Lance of Faith",
    class: "Cleric",
    level: 1,
    description: "A brilliant ray of light sears your foe with golden radiance. Sparkles of light linger around the target, guiding your ally's attack.",
    keywords: ["Divine", "Implement", "Radiant"],
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "ranged",
        target_type: "creature",
        amount: 1,
        distance: "5",
    },
    damage: {
        lvl_1: '$add({1d8},$attr_mod(owner, "wis"))',
        lvl_21: '$add({2d8},$attr_mod(owner, "wis"))',
    },
    roll: {
        attack: "wis",
        defense: "reflex",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "primary_damage",
                target_label: "primary_target",
                damage_types: ["radiant"],
            },
            {
                type: INSTRUCTION_TYPE.SELECT_TARGET,
                targeting_type: "line_of_sight",
                target_type: "ally",
                amount: 1,
                target_label: "buffed_ally",
            },
            {
                type: INSTRUCTION_TYPE.APPLY_STATUS,
                target_label: "buffed_ally",
                duration: "until_your_next_attack_roll_against_target",
                status: {
                    type: "gain_attack_bonus",
                    value: 2,
                    against_creatures: "primary_target",
                },
            },
        ],
    },
}

const righteous_brand: IRPower = {
    name: "Righteous Brand",
    class: "Cleric",
    level: 1,
    description: "You smite your foe with your weapon and brand it with a ghostly, glowing symbol of your deity's anger. By naming one of your allies when the symbol appears, you add divine power to that ally's attacks against the branded foe.",
    keywords: ["Divine", "Weapon"],
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "melee_weapon",
        target_type: "creature",
        amount: 1,
    },
    damage: {
        lvl_1: '$add({1W},$attr_mod(owner, "str"))',
        lvl_21: '$add({2W},$attr_mod(owner, "str"))',
    },
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "primary_damage",
                target_label: "primary_target",
            },
            {
                type: INSTRUCTION_TYPE.SELECT_TARGET,
                targeting_type: "ranged",
                target_type: "ally",
                amount: 1,
                distance: "5",
                target_label: "branded_ally",
            },
            {
                type: INSTRUCTION_TYPE.APPLY_STATUS,
                target_label: "branded_ally",
                duration: "until_end_of_your_next_turn",
                status: {
                    type: "gain_attack_bonus",
                    value: 3,
                    //TODO against_creatures could be a condition too
                    against_creatures: "primary_target",
                    conditions: ['$equals($targeting_type(current_power), "melee")'],
                },
            },
        ],
    },
}

const priests_shield: IRPower = {
    name: "Priest's Shield",
    class: "Cleric",
    level: 1,
    description: "You utter a minor defensive prayer to protect a comrade as you attack with your weapon.",
    keywords: ["Divine", "Weapon"],
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "melee_weapon",
        target_type: "creature",
        amount: 1,
    },
    damage: {
        lvl_1: '$add({1W},$attr_mod(owner, "str"))',
        lvl_21: '$add({2W},$attr_mod(owner, "str"))',
    },
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "primary_damage",
                target_label: "primary_target",
            },
            {
                type: INSTRUCTION_TYPE.SELECT_TARGET,
                targeting_type: "adjacent",
                target_type: "ally",
                amount: 1,
                target_label: "shielded_ally",
            },
            {
                type: IR_INSTRUCTION_TYPE.CONDITION,
                condition: "$exists(shielded_ally)",
                instructions_true: [
                    {
                        type: INSTRUCTION_TYPE.APPLY_STATUS,
                        target_label: "shielded_ally",
                        duration: "until_end_of_your_next_turn",
                        status: {
                            type: "gain_defense_bonus",
                            value: 1,
                            defense: "ac",
                        },
                    },
                ]
            },
            {
                type: INSTRUCTION_TYPE.APPLY_STATUS,
                target_label: "owner",
                duration: "until_end_of_your_next_turn",
                status: {
                    type: "gain_defense_bonus",
                    value: 1,
                    defense: "ac",
                },
            },
        ],
    },
}

export const CLERIC_POWERS = [cause_fear, lance_of_faith, priests_shield, righteous_brand].map(transform_power_ir_into_vm_representation)
