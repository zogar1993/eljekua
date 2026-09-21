import type {IRPower} from "core/types";

export const FIRE_ATTACK: IRPower = {
    name: "Fire Attack",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "melee_weapon",
        target_type: "enemy",
        amount: 1,
    },
    effect: [
        {
            type: "set_hit_status",
            target: "primary_target",
            status: 1,
        },
        {
            type: "apply_damage",
            value: "4",
            target: "primary_target",
            damage_types: ["fire"],
        },
    ],
}

export const FIRE_NECROTIC_ATTACK: IRPower = {
    name: "Fire Necrotic Attack",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "melee_weapon",
        target_type: "enemy",
        amount: 1,
    },
    effect: [
        {
            type: "set_hit_status",
            target: "primary_target",
            status: 1,
        },
        {
            type: "apply_damage",
            value: "4",
            target: "primary_target",
            damage_types: ["fire", "necrotic"],
        },
    ],
}

export const UNTYPED_DAMAGE: IRPower = {
    name: "Untyped Damage",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "melee_weapon",
        target_type: "enemy",
        amount: 1,
    },
    effect: [
        {
            type: "set_hit_status",
            target: "primary_target",
            status: 1,
        },
        {
            type: "apply_damage",
            value: "4",
            target: "primary_target",
        },
    ],
}
