import {Token} from "tokenizer/tokenize";

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
        attack: "str",
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
