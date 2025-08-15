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
        before_instructions?: Array<IRInstruction>
        hit: Array<IRInstruction>
        miss?: Array<IRInstruction>
    }
    effect?: Array<IRInstruction>
}

type Targeting =
    Omit<IRInstructionSelectTargetMelee, "type" | "target_label"> |
    Omit<IRInstructionSelectTargetMovement, "type" | "target_label"> |
    Omit<IRInstructionSelectTargetAreaBurst, "type" | "target_label"> |
    Omit<IRInstructionSelectTargetRanged, "type" | "target_label">

export type IRInstruction =
    {
        type: "apply_damage"
        value: string
        target: string
        half_damage?: boolean
        damage_types?: Array<string>
    } |
    IRInstructionSelectTarget |
    {
        type: "move" | "shift",
        target: "owner",
        destination: string
    } | {
    type: "condition",
    condition: string,
    instructions_true: Array<IRInstruction>
    instructions_false?: Array<IRInstruction>
} | {
    type: "options",
    options: Array<{ text: string, instructions: Array<IRInstruction> }>
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

export type IRInstructionSelectTarget =
    { type: "select_target", target_label: string } &
    (IRInstructionSelectTargetMelee |
        IRInstructionSelectTargetMovement |
        IRInstructionSelectTargetRanged |
        IRInstructionSelectTargetAreaBurst)

type IRInstructionSelectTargetMelee = {
    targeting_type: "adjacent" | "melee_weapon"
    target_type: "enemy" | "creature"
    amount: 1,
    exclude?: ["primary_target"]
}

type IRInstructionSelectTargetMovement = {
    targeting_type: "movement"
    distance: string | number
    destination_requirement?: string
}

type IRInstructionSelectTargetRanged = {
    targeting_type: "ranged"
    target_type: "terrain" | "enemy" | "creature"
    terrain_prerequisite?: "unoccupied"
    amount: 1
    distance: string | number
    exclude?: ["primary_target"]
}

type IRInstructionSelectTargetAreaBurst = {
    targeting_type: "area_burst"
    target_type: "creature"
    amount: "all"
    distance: number
    radius: number
}
