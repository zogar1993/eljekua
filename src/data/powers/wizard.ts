import type {IRPower} from "core/types";
import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {HIT_STATUS} from "core/virtual_machine/expressions/constants/HitStatus";

const magic_missile: IRPower = {
    name: "Magic Missile",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "ranged",
        target_type: "creature",
        amount: 1,
        distance: "20"
    },
    damage: '$add(2,$attr_mod(owner, "int"))',
    effect: [
        {
            type: INSTRUCTION_TYPE.SET_HIT_STATUS,
            target_label: "primary_target",
            status: HIT_STATUS.HIT,
        },
        {
            type: INSTRUCTION_TYPE.APPLY_DAMAGE,
            value: "primary_damage",
            target_label: "primary_target",
            damage_types: ["force"]
        }
    ]
}

const ray_of_frost: IRPower = {
    name: "Ray of Frost",
    class: "Wizard",
    level: 1,
    description: "You fire a blisteringly cold ray of white frost at your foe, slowing its movement.",
    keywords: ["Arcane", "Cold", "Evocation", "Implement"],
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "ranged",
        target_type: "creature",
        amount: 1,
        distance: "10",
    },
    damage: {
        //TODO check if handling damage this way is ok
        lvl_1: '$add({1d6},$attr_mod(owner, "int"))',
        lvl_21: '$add({2d6},$attr_mod(owner, "int"))',
    },
    roll: {
        attack: "int",
        defense: "fortitude",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "primary_damage",
                target_label: "primary_target",
                damage_types: ["cold"],
            },
            {
                type: INSTRUCTION_TYPE.APPLY_STATUS,
                target_label: "primary_target",
                duration: "until_end_of_your_next_turn",
                status: {type: "slowed"},
            },
        ],
    },
}

const scorching_burst: IRPower = {
    name: "Scorching Burst",
    description: "You create a vertical column of golden flames that burns all within.",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "area_burst",
        target_type: "creature",
        amount: "all",
        distance: 10,
        radius: 1
    },
    damage: '$add({1d6},$attr_mod(owner, "int"))',
    roll: {
        attack: "int",
        defense: "reflex",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "primary_damage",
                target_label: "primary_target",
                damage_types: ["fire"]
            },
        ]
    },
}

export const WIZARD_POWERS = [magic_missile, ray_of_frost, scorching_burst].map(transform_power_ir_into_vm_representation)