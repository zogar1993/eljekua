import type {Power} from "scripts/types.ts";
import {
    transform_power_ir_into_vm_representation
} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";

const shift: Power = {
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

const movement: Power = {
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

const melee_basic_attack: Power = {
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

const opportunity_attack: Power = {
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
            `$is_lower_or_equal($distance(triggerer,owner),$opportunity_attack_range(owner))`,
            `$are_enemies(triggerer,owner)`,
        ],
    },
    effect: [
        {type: "add_powers", creature: "owner", cost: "opportunity", filter: "melee_basic_attack"}
    ]
}

export const BASIC_MOVEMENT_ACTIONS = [movement, shift].map(transform_power_ir_into_vm_representation)
export const BASIC_ATTACK_ACTIONS = [melee_basic_attack, opportunity_attack].map(transform_power_ir_into_vm_representation)
