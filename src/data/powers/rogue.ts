import {IRPower} from "core/types";
import {
    transform_power_ir_into_vm_representation
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";

const sly_flourish = {
    name: "Sly Flourish",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        type: "melee_weapon_or_ranged_weapon",
        target_type: "creature",
        amount: 1
    },
    roll: {
        attack: "dex",
        defense: "ac",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "$add({1W},owner.dex_mod,owner.cha_mod)",
                target: "primary_target"
            },
        ]
    },
}

const piercing_strike: IRPower = {
    name: "Piercing Strike",
    description: "You drive your weapon past your foe's guard and into a tender spot.",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "melee_weapon",
        target_type: "creature",
        amount: 1
    },
    roll: {
        attack: "dex",
        defense: "reflex",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "$add({1W},owner.dex_mod)",
                target: "primary_target"
            },
        ]
    },
}

export const ROGUE_POWERS = [piercing_strike].map(transform_power_ir_into_vm_representation)