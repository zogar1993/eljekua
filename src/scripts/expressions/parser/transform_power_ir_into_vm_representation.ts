import {to_ast} from "scripts/expressions/parser/to_ast";
import type {
    IRInstruction,
    IRInstructionSelectTarget,
    Power,
    StatusDurationValue
} from "scripts/types";
import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {ATTRIBUTE_CODES} from "scripts/character_sheet/attributes";
import type {IRInstructionApplyStatus} from "scripts/types";

import {DefenseCode} from "scripts/character_sheet/get_creature_defense";
import {ActionType} from "scripts/battlegrid/creatures/ActionType";

const PRIMARY_TARGET_LABEL = "primary_target"

export const transform_power_ir_into_vm_representation = (power: Power): PowerVM => {
    const formatted_targeting = {type: "select_target", target_label: PRIMARY_TARGET_LABEL, ...power.targeting}
    const instructions: Array<Instruction> = [
        ...(power.damage ? transform_primary_damage(power.damage) : []),
        transform_select_target_ir(formatted_targeting as IRInstructionSelectTarget),
        ...(power.roll ? [transform_primary_roll(power.roll)] : []),
        ...transform_instructions(power.effect)
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
    attack: AstNode
    defense: DefenseCode
    defender: string
    before_instructions: Array<Instruction>
    hit: Array<Instruction>
    miss: Array<Instruction>
}

export type InstructionCondition = {
    type: "condition",
    condition: AstNode,
    instructions_true: Array<Instruction>
    instructions_false: Array<Instruction>
}

export type InstructionApplyDamage = {
    type: "apply_damage"
    value: AstNode
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

export type InstructionOptionsItem = { text: string, instructions: Array<Instruction>, condition?: AstNode }

export type InstructionSaveVariable = {
    type: "save_variable",
    value: AstNode,
    label: string
}

export type InstructionSaveResolvedNumber = {
    type: "save_number_as_resolved",
    value: AstNode,
    label: string
}

export type InstructionAddPowers = {
    type: "add_powers",
    creature: string
}

export type InstructionExecutePower = {
    type: "execute_power",
    power: string
}

export type InstructionForceMovement = {
    type: "force_movement",
    movement_type: "push" | "pull" | "slide",
    target: AstNode,
    destination: AstNode
}

export type InstructionSetPowerFrameHitStatus = {
    type: "set_power_frame_hit_status"
    value: HitStatus
}

export type InstructionApplyStatus = {
    type: "apply_status",
    target: AstNode,
    duration: Array<StatusDurationValue>
    status: {
        type: "grant_combat_advantage",
        against: AstNode,
    } | {
        type: "gain_resistance"
        value: AstNode
        against: AstNode,
    } | {
        type: "gain_attack_bonus"
        value: AstNode
        against: AstNode,
    }
}

export type Instruction =
    InstructionApplyDamage |
    InstructionSelectTarget |
    InstructionAttackRoll |
    InstructionCondition |
    InstructionMovement |
    InstructionOptions |
    InstructionSaveVariable |
    InstructionSaveResolvedNumber |
    InstructionAddPowers |
    InstructionExecutePower |
    InstructionSetPowerFrameHitStatus |
    InstructionApplyStatus |
    InstructionForceMovement |
    InstructionExpendAction

const transform_primary_roll = (roll: Required<Power>["roll"]): InstructionAttackRoll => {
    return {
        type: "attack_roll",
        attack: to_ast(standardize_attack(roll.attack)),
        defense: roll.defense,
        defender: PRIMARY_TARGET_LABEL,
        before_instructions: transform_instructions(roll.before_instructions),
        hit: transform_instructions(roll.hit),
        miss: transform_instructions(roll.miss)
    }
}

const standardize_attack = (text: string) =>
    ATTRIBUTE_CODES.reduce((text, attribute) => text.replaceAll(attribute, `owner.${attribute}_mod_lvl`), text)

const transform_instructions = (instructions: Array<IRInstruction> | undefined): Array<Instruction> => {
    if (instructions === undefined) return []
    return instructions.flatMap(transform_generic_instruction)
}

const transform_generic_instruction = (instruction: IRInstruction): Array<Instruction> => {
    switch (instruction.type) {
        case "apply_damage":
            return [{
                type: "apply_damage",
                value: to_ast(instruction.value),
                target: instruction.target,
                damage_types: instruction.damage_types ?? [],
                half_damage: instruction.half_damage ?? false
            }]
        case "select_target":
            return [transform_select_target_ir(instruction)]
        case "move":
            return [{
                type: "move",
                target: instruction.target,
                destination: instruction.destination
            }]
        case "shift":
            return [{
                type: "shift",
                target: instruction.target,
                destination: instruction.destination
            }]
        case "condition":
            return [{
                type: "condition",
                condition: to_ast(instruction.condition),
                instructions_true: transform_instructions(instruction.instructions_true),
                instructions_false: transform_instructions(instruction.instructions_false)
            }]
        case "options":
            return [{
                type: "options",
                options: instruction.options.map(option => ({
                    text: option.text,
                    instructions: transform_instructions(option.instructions)
                }))
            }]
        case "save_variable":
            return [{
                type: "save_variable",
                value: to_ast(instruction.value),
                label: instruction.label
            }]
        case "save_number_as_resolved":
            return [{
                type: "save_number_as_resolved",
                label: instruction.label,
                value: to_ast(instruction.value)
            }]
        case "push":
            return [
                {
                    type: "select_target",
                    targeting_type: "push",
                    distance: to_ast(instruction.amount),
                    anchor: to_ast("owner.position"),
                    origin: to_ast(`${instruction.target}.position`),
                    target_label: "push_position"
                },
                {
                    type: "force_movement",
                    movement_type: "push",
                    target: to_ast(instruction.target),
                    destination: to_ast("push_position")
                }
            ]
        case "apply_status":
            return [{
                type: "apply_status",
                target: to_ast(instruction.target),
                duration: typeof instruction.duration === "string" ? [instruction.duration] : instruction.duration,
                status: transform_apply_status_ir(instruction)
            }]
        default:
            throw Error(`instruction invalid ${JSON.stringify(instruction)}`)
    }
}

export type InstructionSelectTarget =
    InstructionSelectTargetRanged |
    InstructionSelectTargetMelee |
    InstructionSelectTargetAreaBurst |
    InstructionSelectTargetMovement |
    InstructionSelectTargetPush

export type InstructionSelectTargetRanged = {
    type: "select_target",
    targeting_type: "ranged"
    target_type: "terrain" | "enemy" | "creature"
    terrain_prerequisite?: "unoccupied"
    amount: 1
    distance: AstNode
    target_label: string
    exclude: Array<AstNode>
}

export type InstructionSelectTargetMelee = {
    type: "select_target"
    targeting_type: "adjacent" | "melee_weapon"
    target_type: "enemy" | "creature"
    amount: 1,
    exclude: Array<AstNode>
    target_label: string
}

export type InstructionSelectTargetAreaBurst = {
    type: "select_target",
    targeting_type: "area_burst"
    target_type: "creature"
    amount: "all"
    distance: AstNode
    radius: number
    target_label: string
}

export type InstructionSelectTargetMovement = {
    type: "select_target"
    targeting_type: "movement"
    distance: AstNode
    target_label: string
    destination_requirement: AstNode | null
}

export type InstructionSelectTargetPush = {
    type: "select_target"
    targeting_type: "push"
    distance: AstNode
    anchor: AstNode
    origin: AstNode
    target_label: string
}

//TODO P1 add action types
export type InstructionExpendAction = {
    type: "expend_action"
    action_type: ActionType
}

const transform_primary_damage = (damage: NonNullable<Power["damage"]>): Array<Instruction> => {
    return [
        {
            type: "save_variable",
            value: to_ast(damage.lvl_1),
            label: "primary_damage"
        },
        ...(damage.lvl_11 ? [{
            type: "condition",
            condition: to_ast("$is_greater_or_equal(owner.level,11)"),
            instructions_true: [{
                type: "save_variable",
                value: to_ast(damage.lvl_11),
                label: "primary_damage"
            }],
            instructions_false: []
        } as InstructionCondition] : []),
        ...(damage.lvl_21 ? [{
            type: "condition",
            condition: to_ast("$is_greater_or_equal(owner.level,21)"),
            instructions_true: [{
                type: "save_variable",
                value: to_ast(damage.lvl_21),
                label: "primary_damage"
            }],
            instructions_false: []
        } as InstructionCondition] : [])
    ]
}

const transform_select_target_ir = (ir: IRInstructionSelectTarget): InstructionSelectTarget => {
    if (ir.targeting_type === "area_burst")
        return {
            type: "select_target",
            targeting_type: ir.targeting_type,
            target_type: ir.target_type,
            amount: ir.amount,
            target_label: ir.target_label,
            distance: to_ast(ir.distance),
            radius: ir.radius,
        }
    if (ir.targeting_type === "movement")
        return {
            type: "select_target",
            targeting_type: ir.targeting_type,
            distance: to_ast(ir.distance),
            target_label: ir.target_label,
            destination_requirement: ir.destination_requirement ? to_ast(ir.destination_requirement) : null,
        }
    if (ir.targeting_type === "ranged")
        return {
            type: "select_target",
            targeting_type: ir.targeting_type,
            target_type: ir.target_type,
            amount: ir.amount,
            target_label: ir.target_label,
            distance: to_ast(ir.distance),
            exclude: ir.exclude ? ir.exclude.map(x => to_ast(x)) : []
        }
    if (ir.targeting_type === "adjacent" || ir.targeting_type === "melee_weapon")
        return {
            type: "select_target",
            targeting_type: ir.targeting_type,
            target_type: ir.target_type,
            amount: ir.amount,
            target_label: ir.target_label,
            exclude: ir.exclude ? ir.exclude.map(x => to_ast(x)) : []
        }
    throw Error(`"${ir.targeting_type}" is not a valid "select_target" targeting_type`)
}


const transform_apply_status_ir = (ir: IRInstructionApplyStatus): InstructionApplyStatus["status"] => {
    const status = ir.status

    switch (status.type) {
        case "grant_combat_advantage":
            return {
                type: "grant_combat_advantage",
                against: to_ast(status.against),
            }
        case "gain_resistance":
            return {
                type: "gain_resistance",
                against: to_ast(status.against),
                value: to_ast(status.value)
            }
        case "gain_attack_bonus":
            return {
                type: "gain_attack_bonus",
                against: to_ast(status.against),
                value: to_ast(status.value)
            }
        default:
            throw Error(`"${ir.status.type}" is not a valid "apply_status" type`)
    }
}
