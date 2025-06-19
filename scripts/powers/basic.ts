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
            destination: "target"
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
            destination: "target"
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
        defense_code: "ac",
    },
    hit: [
        {
            type: "apply_damage",
            value: tokenize("d4")
        }
    ]
}

export const BASIC_MOVEMENT_ACTIONS = [movement, shift]
export const BASIC_ATTACK_ACTIONS = [melee_basic_attack]
