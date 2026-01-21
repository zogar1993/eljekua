import {to_ast} from "scripts/expressions/parser/to_ast";
import type {IRInstruction, IRInstructionApplyStatus, IRInstructionSelectTarget, Power} from "scripts/types";
import {ATTRIBUTE_CODES} from "scripts/character_sheet/attributes";
import {
    Instruction,
    InstructionApplyStatus,
    InstructionAttackRoll,
    InstructionCondition,
    InstructionSelectTarget
} from "scripts/expressions/parser/instructions";
import {ActionType} from "scripts/battlegrid/creatures/ActionType";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";

const PRIMARY_TARGET_LABEL = "primary_target"

export const transform_power_ir_into_vm_representation = (power: Power): PowerVM => {
    const instructions: Array<Instruction> = [
        ...(power.damage ? transform_primary_damage(power.damage) : []),
        ...(power.targeting ? [transform_select_target_ir(power.targeting)] : []),
        ...(power.roll ? [transform_primary_roll(power.roll)] : []),
        ...transform_instructions(power.effect)
    ]

    return {
        name: power.name,
        description: power.description,
        trigger: power.trigger ? transform_trigger(power.trigger) : null,
        type: {
            ...power.type,
            traits: power.type.traits || []
        },
        instructions: instructions
    }
}
//TODO P4 rename power vm so that it is power
export type PowerVM = {
    name: string
    description?: string
    type: {
        action: ActionType
        cooldown: "at-will" | "encounter" | "daily"
        attack: boolean
        traits: Array<"melee_basic_attack">
    }
    trigger: Trigger | null
    instructions: Array<Instruction>
}

export type Trigger = {
    type: "interruption" | "reaction"
    intercepts: Array<"movement">
    conditions: Array<AstNode>
}

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
                    defender: to_ast(instruction.target),
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
        case "add_powers":
            return [{
                type: "add_powers",
                cost: instruction.cost,
                filter: instruction.filter,
                creature: to_ast(instruction.creature)
            }]
        default:
            throw Error(`instruction invalid ${JSON.stringify(instruction)}`)
    }
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

const transform_trigger = (trigger: NonNullable<Power["trigger"]>): Trigger => {
    return {
        type: trigger.type,
        intercepts: trigger.intercepts,
        conditions: trigger.conditions.map(x => to_ast(x))
    }
}

const transform_select_target_ir = (props: Omit<IRInstructionSelectTarget, "type" | "target_label">): InstructionSelectTarget => {
    const ir = {type: "select_target", target_label: PRIMARY_TARGET_LABEL, ...props} as IRInstructionSelectTarget

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