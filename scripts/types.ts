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

type Targeting =
    Omit<IRConsequenceSelectTargetMelee, "type" | "target_label"> |
    Omit<IRConsequenceSelectTargetMovement, "type" | "target_label"> |
    Omit<IRConsequenceSelectTargetAreaBurst, "type" | "target_label"> |
    Omit<IRConsequenceSelectTargetRanged, "type" | "target_label">

export type IRConsequence =
    {
        type: "apply_damage"
        value: string
        target: string
        half_damage?: boolean
        damage_types?: Array<string>
    } |
    IRConsequenceSelectTarget |
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
    options: Array<{ text: string, consequences: Array<IRConsequence> }>
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

export type IRConsequenceSelectTarget =
    { type: "select_target", target_label: string } &
    (IRConsequenceSelectTargetMelee |
        IRConsequenceSelectTargetMovement |
        IRConsequenceSelectTargetRanged |
        IRConsequenceSelectTargetAreaBurst)

type IRConsequenceSelectTargetMelee = {
    targeting_type: "adjacent" | "melee_weapon"
    target_type: "enemy"
    amount: 1,
    exclude?: ["primary_target"]
}

type IRConsequenceSelectTargetMovement = {
    targeting_type: "movement"
    distance: string | number
    destination_requirement?: string
}

type IRConsequenceSelectTargetRanged = {
    targeting_type: "ranged"
    target_type: "terrain" | "enemy" | "creature"
    terrain_prerequisite?: "unoccupied"
    amount: 1
    distance: string | number
    exclude?: ["primary_target"]
}

type IRConsequenceSelectTargetAreaBurst = {
    targeting_type: "area_burst"
    target_type: "creature"
    amount: "all"
    distance: number
    radius: number
}
