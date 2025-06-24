export type Power = {
    name: string
    description?: string
    type: {
        action: "standard" | "movement" | "minor" | "free"
        cooldown: "at-will" | "encounter" | "daily"
        attack: boolean
    }
    targeting: Targeting,
    roll?: {
        attack: string
        defense: string
        hit: Array<IRConsequence>
        miss?: Array<IRConsequence>
    }
    effect?: Array<IRConsequence>
}

type Targeting = {
    target_type: "terrain" | "enemy" | "creature"
    terrain_prerequisite?: "unoccupied"
    amount: 1
} & ({
    type: "melee_weapon" | "adjacent",
} | {
    type: "movement" | "ranged"
    distance: string,
})

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
        destination: "primary_target"
    } | {
    type: "condition",
    condition: string,
    consequences_true: Array<IRConsequence>
    consequences_false?: Array<IRConsequence>
}
