import {Token} from "formulas/tokenize";

export type Power = {
    name: string,
    type: {
        action: "standard" | "movement" | "minor" | "free",
        cooldown: "at-will" | "encounter" | "daily",
        attack: boolean
    }
    targeting: {
        type: "movement",
        distance: Array<Token>,
        target_type: "terrain" | "enemy",
        terrain_prerequisite?: "unoccupied",
        amount: 1
    } | {
        type: "melee",
        target_type: "terrain" | "enemy",
        terrain_prerequisite?: "unoccupied",
        amount: 1
    },
    attack?: {
        attack: "strength_mod",
        defense: "ac",
    }
    hit?: Array<
        {
            type: "apply_damage",
            value: Array<Token>,
        }
    >
    effect?: [
        {
            type: "move" | "shift",
            target: "owner",
            destination: "target"
        }
    ]
}
