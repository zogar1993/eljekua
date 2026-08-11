import {IRPower} from "core/types";
import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {INSTRUCTION_TYPE} from "core/expressions/parser/instructions";

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
    effect: [
        {
            type: INSTRUCTION_TYPE.APPLY_DAMAGE,
            value: "$add(2,owner.int_mod)",
            target: "primary_target",
            damage_types: ["force"] //TODO P1 add vulnerabilities and resistances
        }
    ]
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
    roll: {
        attack: "int",
        defense: "reflex",
        before_consequences: [
            {
                type: INSTRUCTION_TYPE.SAVE_NUMBER_AS_RESOLVED,
                value: "$add({1d6},owner.int_mod)",
                label: "primary_damage"
            }
        ],
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "primary_damage",
                target: "primary_target",
                damage_types: ["fire"]
            },
        ]
    },
}

export const WIZARD_POWERS = [magic_missile, scorching_burst].map(transform_power_ir_into_vm_representation)