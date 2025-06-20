import type {Power} from "types.ts";
import {tokenize} from "tokenizer/tokenize";

const shift: Power = {
    name: "Shift",
    type: {
        action: "movement",
        cooldown: "at-will",
        attack: false,
    },
    targeting: {
        type: "movement",
        distance: tokenize("1"),
        target_type: "terrain",
        terrain_prerequisite: "unoccupied",
        amount: 1
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
        type: "movement",
        distance: tokenize("owner.movement"),
        target_type: "terrain",
        terrain_prerequisite: "unoccupied",
        amount: 1
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
    },
    targeting: {
        type: "melee",
        target_type: "enemy",
        amount: 1
    },
    attack: {
        attack: "str",
        defense: "ac",
    },
    hit: [
        {
            type: "apply_damage",
            value: tokenize("[1W]+owner.str_mod")
        }
    ]
}

const cleave: Power = {
    name: "Cleave",
    description: "You hit one enemy, then cleave into another.",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        type: "melee",
        target_type: "enemy",
        amount: 1
    },
    attack: {
        attack: "str",
        defense: "ac",
    },
    hit: [
        {
            type: "select_target",
            targeting: {
                type: "adjacent",
                target_type: "enemy",
                amount: 1,
                exclude: ["primary_target"]
            },
            target_label: "secondary_target"
        },
        {
            type: "apply_damage",
            value: tokenize("[1W]+owner.str_mod")
        },
        {
            type: "apply_damage",
            value: tokenize("owner.str_mod"),
            target: "secondary_target",
        },
    ]
}

export const BASIC_MOVEMENT_ACTIONS = [movement, shift]
export const BASIC_ATTACK_ACTIONS = [melee_basic_attack]
