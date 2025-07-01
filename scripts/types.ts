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
        hit: Array<IRConsequence>
        miss?: Array<IRConsequence>
    }
    effect?: Array<IRConsequence>
}

type Targeting = TargetingDistanceImplicit | TargetingDistanceExplicit

type TargetingDistanceImplicit = {
    target_type: "terrain" | "enemy" | "creature" | "path"
    terrain_prerequisite?: "unoccupied"
    amount: 1
    type: "melee_weapon" | "adjacent",
}

type TargetingDistanceExplicit = {
    target_type: "terrain" | "enemy" | "creature" | "path"
    terrain_prerequisite?: "unoccupied"
    amount: 1
    type: "movement" | "ranged"
    distance: string,
}

export const is_explicit_targeting = (target: Targeting): target is TargetingDistanceExplicit =>
    target.type === "movement" || target.type === "ranged"

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
}
