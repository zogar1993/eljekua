import {tokenize} from "tokenizer/tokenize";
import {
    IRConsequence, IRConsequenceSelectTarget,
    Power
} from "types";
import {Token} from "tokenizer/tokens/AnyToken";
import {ATTRIBUTE_CODES} from "character_sheet/attributes";

const PRIMARY_TARGET_LABEL = "primary_target"

export const transform_power_ir_into_vm_representation = (power: Power): PowerVM => {
    const formatted_targeting = {type: "select_target", target_label: PRIMARY_TARGET_LABEL, ...power.targeting}
    const consequences: Array<Consequence> = [
        transform_select_target_ir(formatted_targeting as IRConsequenceSelectTarget),
        ...(power.roll ? [transform_primary_roll(power.roll)] : []),
        ...(power.effect ? power.effect.map(transform_generic_consequence) : [])
    ]
    return {
        name: power.name,
        description: power.description,
        type: power.type,
        consequences: consequences
    }

}

export type PowerVM = {
    name: string
    description?: string
    type: {
        action: "standard" | "movement" | "minor" | "free"
        cooldown: "at-will" | "encounter" | "daily"
        attack: boolean
    }
    consequences: Array<Consequence>
}

export type ConsequenceAttackRoll = {
    type: "attack_roll"
    attack: Token
    defense: string
    defender: string
    before_consequences: Array<Consequence>
    hit: Array<Consequence>
    miss: Array<Consequence>
}

export type ConsequenceCondition = {
    type: "condition",
    condition: Token,
    consequences_true: Array<Consequence>
    consequences_false: Array<Consequence>
}

export type ConsequenceApplyDamage = {
    type: "apply_damage"
    value: Token
    target: string
    half_damage: boolean
    damage_types: Array<string>
}

export type ConsequenceMovement = {
    type: "move" | "shift"
    target: string
    destination: string
}

export type ConsequenceOptions = {
    type: "options",
    options: Array<ConsequenceOptionsItem>,
}

export type ConsequenceOptionsItem = { text: string, consequences: Array<Consequence> }

export type ConsequenceSavePosition = {
    type: "save_position",
    target: string,
    label: string
}

export type ConsequenceSaveResolvedNumber = {
    type: "save_resolved_number",
    value: Token,
    label: string
}

export type ConsequencePush = {
    type: "push",
    amount: Token,
    target: string
}

export type ConsequenceCopyVariable = {
    type: "copy_variable",
    origin: string,
    destination: string
}

export type ConsequenceExecutePower = {
    type: "execute_power",
    power: string
}

export type Consequence =
    ConsequenceApplyDamage |
    ConsequenceSelectTarget |
    ConsequenceAttackRoll |
    ConsequenceCondition |
    ConsequenceMovement |
    ConsequenceOptions |
    ConsequenceSavePosition |
    ConsequenceSaveResolvedNumber |
    ConsequencePush |
    ConsequenceCopyVariable |
    ConsequenceExecutePower

const transform_primary_roll = (roll: Required<Power>["roll"]): ConsequenceAttackRoll => {
    return {
        type: "attack_roll",
        attack: tokenize(standardize_attack(roll.attack)),
        defense: roll.defense,
        defender: PRIMARY_TARGET_LABEL,
        before_consequences: roll.before_consequences?.map(transform_generic_consequence) || [],
        hit: roll.hit.map(transform_generic_consequence),
        miss: roll.miss?.map(transform_generic_consequence) || []
    }
}

const standardize_attack = (text: string) =>
    ATTRIBUTE_CODES.reduce((text, attribute) => text.replaceAll(attribute, `owner.${attribute}_mod_lvl`), text)

const transform_generic_consequence = (consequence: IRConsequence): Consequence => {
    switch (consequence.type) {
        case "apply_damage":
            return {
                type: "apply_damage",
                value: tokenize(consequence.value),
                target: consequence.target,
                damage_types: consequence.damage_types ?? [],
                half_damage: consequence.half_damage ?? false
            }
        case "select_target":
            return transform_select_target_ir(consequence)
        case "move":
            return {
                type: "move",
                target: consequence.target,
                destination: consequence.destination
            }
        case "shift":
            return {
                type: "shift",
                target: consequence.target,
                destination: consequence.destination
            }
        case "condition":
            return {
                type: "condition",
                condition: tokenize(consequence.condition),
                consequences_true: consequence.consequences_true.map(transform_generic_consequence),
                consequences_false: consequence.consequences_false ? consequence.consequences_false.map(transform_generic_consequence) : []
            }
        case "options":
            return {
                type: "options",
                options: consequence.options.map(option => ({
                    text: option.text,
                    consequences: option.consequences.map(transform_generic_consequence)
                }))
            }
        case "save_position":
            return {
                type: "save_position",
                label: consequence.label,
                target: consequence.target
            }
        case "save_resolved_number":
            return {
                type: "save_resolved_number",
                label: consequence.label,
                value: tokenize(consequence.value)
            }
        case "push":
            return {
                type: "push",
                amount: tokenize(consequence.amount),
                target: consequence.target
            }
        default:
            throw Error(`consequence invalid ${JSON.stringify(consequence)}`)
    }
}


export type ConsequenceSelectTarget =
    ConsequenceSelectTargetRanged |
    ConsequenceSelectTargetMelee |
    ConsequenceSelectTargetAreaBurst |
    ConsequenceSelectTargetMovement

export type ConsequenceSelectTargetRanged = {
    type: "select_target",
    targeting_type: "ranged"
    target_type: "terrain" | "enemy" | "creature"
    terrain_prerequisite?: "unoccupied"
    amount: 1
    distance: Token
    target_label: string
    exclude: Array<string>
}

export type ConsequenceSelectTargetMelee = {
    type: "select_target"
    targeting_type: "adjacent" | "melee_weapon"
    target_type: "enemy"
    amount: 1,
    exclude: Array<string>
    target_label: string
}

export type ConsequenceSelectTargetAreaBurst = {
    type: "select_target",
    targeting_type: "area_burst"
    target_type: "creature"
    amount: "all"
    distance: Token
    radius: number
    target_label: string
}

export type ConsequenceSelectTargetMovement = {
    type: "select_target"
    targeting_type: "movement"
    distance: Token
    target_label: string
    destination_requirement: Token | null
}

const transform_select_target_ir = (ir: IRConsequenceSelectTarget): ConsequenceSelectTarget => {
    if (ir.targeting_type === "area_burst")
        return {
            type: "select_target",
            targeting_type: ir.targeting_type,
            target_type: ir.target_type,
            amount: ir.amount,
            target_label: ir.target_label,
            distance: tokenize(ir.distance),
            radius: ir.radius,
        }
    if (ir.targeting_type === "movement")
        return {
            type: "select_target",
            targeting_type: ir.targeting_type,
            distance: tokenize(ir.distance),
            target_label: ir.target_label,
            destination_requirement: ir.destination_requirement ? tokenize(ir.destination_requirement) : null
        }
    if (ir.targeting_type === "ranged")
        return {
            type: "select_target",
            targeting_type: ir.targeting_type,
            target_type: ir.target_type,
            amount: ir.amount,
            target_label: ir.target_label,
            distance: tokenize(ir.distance),
            exclude: ir.exclude || []
        }
    if (ir.targeting_type === "adjacent" || ir.targeting_type === "melee_weapon")
        return {
            type: "select_target",
            targeting_type: ir.targeting_type,
            target_type: ir.target_type,
            amount: ir.amount,
            target_label: ir.target_label,
            exclude: ir.exclude || []
        }
    throw Error(`"${ir.targeting_type}" is not a valid "select_target" targeting_type`)
}

