import {Token} from "tokenizer/tokenize";

export type Power = {
    name: string
    description?: string
    type: {
        action: "standard" | "movement" | "minor" | "free"
        cooldown: "at-will" | "encounter" | "daily"
        attack: boolean
    }
    targeting: Targeting,
    attack?: {
        attack: "str"
        defense: "ac"
    }
    hit?: Array<Effect>
    effect?: Array<Effect>
}

type Targeting = {
    type: "movement",
    distance: Array<Token>,
    target_type: "terrain" | "enemy"
    terrain_prerequisite?: "unoccupied"
    amount: 1
} | {
    type: "melee",
    target_type: "terrain" | "enemy"
    terrain_prerequisite?: "unoccupied"
    amount: 1
}

type Effect =
    {
        type: "apply_damage"
        value: Array<Token>
        target?: string
    } |
    {
        type: "select_target"
        targeting: {
            type: "adjacent"
            target_type: "enemy"
            amount: 1,
            exclude: ["primary_target"]
        },
        target_label: "secondary_target"
    } |
    {
        type: "move" | "shift",
        target: "owner",
        destination: "primary_target"
    }
