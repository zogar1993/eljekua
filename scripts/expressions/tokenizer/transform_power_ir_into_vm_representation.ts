import {tokenize} from "expressions/tokenizer/tokenize";
import type {
    IRInstruction,
    IRInstructionSelectTarget,
    Power,
    StatusDuration
} from "types";
import type {Token} from "expressions/tokenizer/tokens/AnyToken";
import {ATTRIBUTE_CODES} from "character_sheet/attributes";
import type {IRInstructionApplyStatus} from "types";

const PRIMARY_TARGET_LABEL = "primary_target"

export const transform_power_ir_into_vm_representation = (power: Power): PowerVM => {
    const formatted_targeting = {type: "select_target", target_label: PRIMARY_TARGET_LABEL, ...power.targeting}
    const instructions: Array<Instruction> = [
        transform_select_target_ir(formatted_targeting as IRInstructionSelectTarget),
        ...(power.roll ? [transform_primary_roll(power.roll)] : []),
        ...(power.effect ? power.effect.map(transform_generic_instruction) : [])
    ]
    return {
        name: power.name,
        description: power.description,
        type: power.type,
        instructions: instructions
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
    instructions: Array<Instruction>
}

export type InstructionAttackRoll = {
    type: "attack_roll"
    attack: Token
    defense: string
    defender: string
    before_instructions: Array<Instruction>
    hit: Array<Instruction>
    miss: Array<Instruction>
}

export type InstructionCondition = {
    type: "condition",
    condition: Token,
    instructions_true: Array<Instruction>
    instructions_false: Array<Instruction>
}

export type InstructionApplyDamage = {
    type: "apply_damage"
    value: Token
    target: string
    half_damage: boolean
    damage_types: Array<string>
}

export type InstructionMovement = {
    type: "move" | "shift"
    target: string
    destination: string
}

export type InstructionOptions = {
    type: "options",
    options: Array<InstructionOptionsItem>,
}

export type InstructionOptionsItem = { text: string, instructions: Array<Instruction>, condition?: Token }

export type InstructionSavePosition = {
    type: "save_position",
    target: string,
    label: string
}

export type InstructionSaveResolvedNumber = {
    type: "save_resolved_number",
    value: Token,
    label: string
}

export type InstructionPush = {
    type: "push",
    amount: Token,
    target: string
}

export type InstructionCopyVariable = {
    type: "copy_variable",
    origin: string,
    destination: string
}

export type InstructionAddPowers = {
    type: "add_powers",
    creature: string
}

export type InstructionExecutePower = {
    type: "execute_power",
    power: string
}

export type InstructionCleanContextStatus = {
    type: "clean_context_status"
}

export type InstructionApplyStatus = {
    type: "apply_status",
    target: Token,
    duration: StatusDuration
    status: {
        type: "grant_combat_advantage",
        against: Token,
    } | {
        type: "gain_resistance"
        value: Token
        against: Token,
    } | {
        type: "gain_attack_bonus"
        value: Token
        against: Token,
    }
}

export type Instruction =
    InstructionApplyDamage |
    InstructionSelectTarget |
    InstructionAttackRoll |
    InstructionCondition |
    InstructionMovement |
    InstructionOptions |
    InstructionSavePosition |
    InstructionSaveResolvedNumber |
    InstructionPush |
    InstructionCopyVariable |
    InstructionAddPowers |
    InstructionExecutePower |
    InstructionCleanContextStatus |
    InstructionApplyStatus

const transform_primary_roll = (roll: Required<Power>["roll"]): InstructionAttackRoll => {
    return {
        type: "attack_roll",
        attack: tokenize(standardize_attack(roll.attack)),
        defense: roll.defense,
        defender: PRIMARY_TARGET_LABEL,
        before_instructions: roll.before_instructions?.map(transform_generic_instruction) || [],
        hit: roll.hit.map(transform_generic_instruction),
        miss: roll.miss?.map(transform_generic_instruction) || []
    }
}

const standardize_attack = (text: string) =>
    ATTRIBUTE_CODES.reduce((text, attribute) => text.replaceAll(attribute, `owner.${attribute}_mod_lvl`), text)

const transform_generic_instruction = (instruction: IRInstruction): Instruction => {
    switch (instruction.type) {
        case "apply_damage":
            return {
                type: "apply_damage",
                value: tokenize(instruction.value),
                target: instruction.target,
                damage_types: instruction.damage_types ?? [],
                half_damage: instruction.half_damage ?? false
            }
        case "select_target":
            return transform_select_target_ir(instruction)
        case "move":
            return {
                type: "move",
                target: instruction.target,
                destination: instruction.destination
            }
        case "shift":
            return {
                type: "shift",
                target: instruction.target,
                destination: instruction.destination
            }
        case "condition":
            return {
                type: "condition",
                condition: tokenize(instruction.condition),
                instructions_true: instruction.instructions_true.map(transform_generic_instruction),
                instructions_false: instruction.instructions_false ? instruction.instructions_false.map(transform_generic_instruction) : []
            }
        case "options":
            return {
                type: "options",
                options: instruction.options.map(option => ({
                    text: option.text,
                    instructions: option.instructions.map(transform_generic_instruction)
                }))
            }
        case "save_position":
            return {
                type: "save_position",
                label: instruction.label,
                target: instruction.target
            }
        case "save_resolved_number":
            return {
                type: "save_resolved_number",
                label: instruction.label,
                value: tokenize(instruction.value)
            }
        case "push":
            return {
                type: "push",
                amount: tokenize(instruction.amount),
                target: instruction.target
            }
        case "apply_status":
            return {
                type: "apply_status",
                target: tokenize(instruction.target),
                duration: typeof instruction.duration === "string" ? [instruction.duration] : instruction.duration,
                status: transform_apply_status_ir(instruction)
            }
        default:
            throw Error(`instruction invalid ${JSON.stringify(instruction)}`)
    }
}

export type InstructionSelectTarget =
    InstructionSelectTargetRanged |
    InstructionSelectTargetMelee |
    InstructionSelectTargetAreaBurst |
    InstructionSelectTargetMovement

export type InstructionSelectTargetRanged = {
    type: "select_target",
    targeting_type: "ranged"
    target_type: "terrain" | "enemy" | "creature"
    terrain_prerequisite?: "unoccupied"
    amount: 1
    distance: Token
    target_label: string
    exclude: Array<string>
}

export type InstructionSelectTargetMelee = {
    type: "select_target"
    targeting_type: "adjacent" | "melee_weapon"
    target_type: "enemy" | "creature"
    amount: 1,
    exclude: Array<string>
    target_label: string
}

export type InstructionSelectTargetAreaBurst = {
    type: "select_target",
    targeting_type: "area_burst"
    target_type: "creature"
    amount: "all"
    distance: Token
    radius: number
    target_label: string
}

export type InstructionSelectTargetMovement = {
    type: "select_target"
    targeting_type: "movement"
    distance: Token
    target_label: string
    destination_requirement: Token | null
}

const transform_select_target_ir = (ir: IRInstructionSelectTarget): InstructionSelectTarget => {
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


const transform_apply_status_ir = (ir: IRInstructionApplyStatus): InstructionApplyStatus["status"] => {
    const status = ir.status

    switch (status.type) {
        case "grant_combat_advantage":
            return {
                type: "grant_combat_advantage",
                against: tokenize(status.against),
            }
        case "gain_resistance":
            return {
                type: "grant_combat_advantage",
                against: tokenize(status.against),
            }
        case "gain_attack_bonus":
            return {
                type: "grant_combat_advantage",
                against: tokenize(status.against),
            }
        default:
            throw Error(`"${ir.status.type}" is not a valid "apply_status" type`)
    }

}

