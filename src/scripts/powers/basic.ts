import type {IRPower} from "scripts/types.ts";
import {
    transform_power_ir_into_vm_representation
} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";

const shift: IRPower = {
    name: "Shift",
    type: {
        action: "movement",
        cooldown: "at-will",
        attack: false,
    },
    targeting: {
        targeting_type: "movement",
        distance: 1
    },
    effect: [
        {
            type: "shift",
            target: "owner",
            destination: "primary_target"
        }
    ]
}

const movement: IRPower = {
    name: "Move",
    type: {
        action: "movement",
        cooldown: "at-will",
        attack: false,
    },
    targeting: {
        targeting_type: "movement",
        distance: "owner.movement",
    },
    effect: [
        {
            type: "move",
            target: "owner",
            destination: "primary_target"
        }
    ]
}

const melee_basic_attack: IRPower = {
    name: "Melee Basic Attack",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
        traits: ["melee_basic_attack"]
    },
    targeting: {
        targeting_type: "melee_weapon",
        target_type: "enemy",
        amount: 1
    },
    roll: {
        attack: "str",
        defense: "ac",
        hit: [
            {
                type: "apply_damage",
                value: "$add({1W},owner.str_mod)",
                target: "primary_target"
            }
        ]
    },
}

const opportunity_attack: IRPower = {
    name: "Opportunity Attack",
    type: {
        action: "opportunity",
        cooldown: "at-will",
        attack: true,
    },
    trigger: {
        type: "interruption",
        intercepts: ["movement"],
        conditions: [
            `$is_lower_or_equal($distance(trigger_activator,trigger_owner),$opportunity_attack_range(trigger_owner))`,
            `$are_enemies(trigger_activator,trigger_owner)`,
        ],
    },
    effect: [
        {type: "add_powers_as_options", creature: "owner", cost: "opportunity", filter: "melee_basic_attack"}
    ]
}

export const BASIC_MOVEMENT_ACTIONS = [movement, shift].map(transform_power_ir_into_vm_representation)
export const BASIC_ATTACK_ACTIONS = [melee_basic_attack, opportunity_attack].map(transform_power_ir_into_vm_representation)
