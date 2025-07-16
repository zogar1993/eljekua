import {Token} from "tokenizer/tokens/AnyToken";

export type Power = {
    name: string
    description?: string
    type: {
        action: "standard" | "movement" | "minor" | "free"
        cooldown: "at-will" | "encounter" | "daily"
        attack: boolean
    }
    prerequisites?: Array<string>,
    targeting: Targeting,
    roll?: {
        attack: string
        defense: string
        before_consequences?: Array<IRConsequence>
        hit: Array<IRConsequence>
        miss?: Array<IRConsequence>
    }
    effect?: Array<IRConsequence>
}

type Targeting = TargetingDistanceImplicit | TargetingDistanceExplicit | TargetingAreaBurst

//TODO this does not scale well, fix later
type TargetingDistanceImplicit = {
    type: "melee_weapon" | "adjacent"
    target_type: "terrain" | "enemy" | "creature" | "path"
    terrain_prerequisite?: "unoccupied"
    amount: 1
}

type TargetingDistanceExplicit = {
    type: "movement" | "ranged"
    target_type: "terrain" | "enemy" | "creature" | "path"
    terrain_prerequisite?: "unoccupied"
    amount: 1
    distance: string
}

type TargetingAreaBurst = {
    type: "area_burst"
    target_type: "terrain" | "enemy" | "creature" | "path"
    amount: "all"
    distance: number
    radius: number
}

export const is_explicit_targeting = (target: Targeting): target is TargetingDistanceExplicit =>
    target.type === "movement" || target.type === "ranged"

export const is_area_burst = (target: Targeting): target is TargetingAreaBurst =>
    target.type === "area_burst"

export type IRConsequence =
    {
        type: "apply_damage"
        value: string
        target: string
        half_damage?: boolean
        damage_types?: Array<string>
    } |
    {
        type: "select_target"
        targeting: {
            type: "adjacent"
            target_type: "enemy"
            amount: 1,
            exclude?: ["primary_target"]
        },
        target_label: "secondary_target"
    } |
    {
        type: "move" | "shift",
        target: "owner",
        destination: string
    } | {
    type: "condition",
    condition: string,
    consequences_true: Array<IRConsequence>
    consequences_false?: Array<IRConsequence>
} | {
    type: "options",
    options: Array<{text: string, consequences: Array<IRConsequence>}>
} | {
    type: "save_position",
    target: string,
    label: string
} | {
    type: "push",
    amount: number,
    target: string
} | {
    type: "save_resolved_number"
    value: string
    label: string
}
