import {to_ast} from "core/expressions/parser/to_ast";
import type {IRInstruction, IRInstructionApplyStatus, IRInstructionSelectTarget, IRPower} from "core/types";
import {ATTRIBUTE_CODES} from "core/character_sheet/attributes";
import {
    INSTRUCTION_TYPE,
    Instruction,
    InstructionApplyStatus,
    InstructionCondition,
    InstructionSelectTarget
} from "core/virtual_machine/instructions/instructions";
import {ACTION_TYPE, ActionType, TURN_ACTION_TYPES} from "core/battlegrid/creatures/ActionType";
import {AstNode} from "core/expressions/parser/nodes/AstNode";

const PRIMARY_TARGET_LABEL = "primary_target"

export const transform_power_ir_into_vm_representation = (power: IRPower): Power => {
    const instructions: Array<Instruction> = [
        ...(power.damage ? transform_primary_damage(power.damage) : []),
        ...(power.targeting ? [transform_select_target_ir(power.targeting)] : []),
        ...(power.roll ? transform_primary_roll(power.roll) : []),
        ...transform_instructions(power.effect)
    ]

    if (TURN_ACTION_TYPES.includes(power.type.action) && power.targeting === undefined)
        throw Error(`Power '${power.name}' does not have a targeting defined despite being a turn action`)

    if (power.type.action === "opportunity" && power.trigger === undefined)
        throw Error(`Power '${power.name}' does not have a trigger defined despite being an opportunity action`)

    if (power.trigger) {
        if (!TRIGGER_ACTION_TYPES.includes(power.type.action))
            throw Error(`Power '${power.name}' with trigger needs to be one of ${JSON.stringify(TRIGGER_ACTION_TYPES)} but is '${power.type.action}'.`)
        //TODO P4 check that no owner can be set on conditions so that we avoid confusing the trigger owner with the triggering power owner
    }

    return {
        name: power.name,
        description: power.description,
        targeting: power.targeting ? transform_select_target_ir(power.targeting) : null,
        trigger: power.trigger ? transform_trigger(power.trigger) : null,
        type: {
            ...power.type,
            traits: power.type.traits || []
        },
        instructions: instructions
    }
}
export type Power = {
    name: string
    description?: string
    type: {
        action: ActionType
        cooldown: "at-will" | "encounter" | "daily"
        attack: boolean
        traits: Array<"melee_basic_attack">
    }
    targeting: InstructionSelectTarget | null
    trigger: Trigger | null
    instructions: Array<Instruction>
}

export type Trigger = {
    type: "interruption" | "reaction"
    intercepts: Array<TriggerInterception>
    conditions: Array<AstNode>
}

export const TRIGGER_INTERCEPTION = {
    MOVEMENT: "movement",
    CRITICAL_HIT: "critical_hit",
} as const

export type TriggerInterception = typeof TRIGGER_INTERCEPTION[keyof typeof TRIGGER_INTERCEPTION]

const transform_primary_roll = (roll: Required<IRPower>["roll"]): Array<Instruction> => [
    {
        type: INSTRUCTION_TYPE.ATTACK_DICE_ROLL,
        attack: to_ast(standardize_attack(roll.attack)),
        defense: roll.defense,
        defender: PRIMARY_TARGET_LABEL,
    },
    ...transform_instructions(roll.before_consequences),
    {
        type: INSTRUCTION_TYPE.ATTACK_ROLL_CONSEQUENCE,
        defender: PRIMARY_TARGET_LABEL,
        hit: transform_instructions(roll.hit),
        miss: transform_instructions(roll.miss)
    }
]

const standardize_attack = (text: string) =>
    ATTRIBUTE_CODES.reduce((text, attribute) => text.replaceAll(attribute, `owner.${attribute}_mod_lvl`), text)

const transform_instructions = (instructions: Array<IRInstruction> | undefined): Array<Instruction> => {
    if (instructions === undefined) return []
    return instructions.flatMap(transform_generic_instruction)
}

const transform_generic_instruction = (instruction: IRInstruction): Array<Instruction> => {
    switch (instruction.type) {
        case INSTRUCTION_TYPE.APPLY_DAMAGE:
            return [{
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: to_ast(instruction.value),
                target: instruction.target,
                damage_types: instruction.damage_types ?? [],
                half_damage: instruction.half_damage ?? false
            }]
        case INSTRUCTION_TYPE.SELECT_TARGET:
            return [transform_select_target_ir(instruction)]
        case INSTRUCTION_TYPE.MOVE:
            return [{
                type: INSTRUCTION_TYPE.MOVE,
                target: instruction.target,
                destination: instruction.destination
            }]
        case INSTRUCTION_TYPE.SHIFT:
            return [{
                type: INSTRUCTION_TYPE.SHIFT,
                target: instruction.target,
                destination: instruction.destination
            }]
        case INSTRUCTION_TYPE.CONDITION:
            return [{
                type: INSTRUCTION_TYPE.CONDITION,
                condition: to_ast(instruction.condition),
                instructions_true: transform_instructions(instruction.instructions_true),
                instructions_false: transform_instructions(instruction.instructions_false)
            }]
        case INSTRUCTION_TYPE.OPTIONS:
            return [{
                type: INSTRUCTION_TYPE.OPTIONS,
                options: instruction.options.map(option => ({
                    text: option.text,
                    instructions: transform_instructions(option.instructions)
                }))
            }]
        case INSTRUCTION_TYPE.SAVE_VARIABLE:
            return [{
                type: INSTRUCTION_TYPE.SAVE_VARIABLE,
                value: to_ast(instruction.value),
                label: instruction.label
            }]
        case INSTRUCTION_TYPE.SAVE_NUMBER_AS_RESOLVED:
            return [{
                type: INSTRUCTION_TYPE.SAVE_NUMBER_AS_RESOLVED,
                label: instruction.label,
                value: to_ast(instruction.value)
            }]
        case "push":
            return [
                {
                    type: INSTRUCTION_TYPE.SELECT_TARGET,
                    targeting_type: "push",
                    distance: to_ast(instruction.amount),
                    anchor: to_ast("owner.position"),
                    defender: to_ast(instruction.target),
                    target_label: "push_position"
                },
                {
                    type: INSTRUCTION_TYPE.FORCE_MOVEMENT,
                    movement_type: "push",
                    target: to_ast(instruction.target),
                    destination: to_ast("push_position")
                }
            ]
        case INSTRUCTION_TYPE.APPLY_STATUS:
            return [{
                type: INSTRUCTION_TYPE.APPLY_STATUS,
                target: to_ast(instruction.target),
                duration: typeof instruction.duration === "string" ? [instruction.duration] : instruction.duration,
                status: transform_apply_status_ir(instruction)
            }]
        case INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS:
            return [{
                type: INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS,
                cost: instruction.cost,
                filter: instruction.filter,
                creature: to_ast(instruction.creature)
            }]
        default:
            throw Error(`instruction invalid ${JSON.stringify(instruction)}`)
    }
}

const transform_primary_damage = (damage: NonNullable<IRPower["damage"]>): Array<Instruction> => {
    return [
        {
            type: INSTRUCTION_TYPE.SAVE_VARIABLE,
            value: to_ast(damage.lvl_1),
            label: "primary_damage"
        },
        ...(damage.lvl_11 ? [{
            type: INSTRUCTION_TYPE.CONDITION,
            condition: to_ast("$is_greater_or_equal(owner.level,11)"),
            instructions_true: [{
                type: INSTRUCTION_TYPE.SAVE_VARIABLE,
                value: to_ast(damage.lvl_11),
                label: "primary_damage"
            }],
            instructions_false: []
        } as InstructionCondition] : []),
        ...(damage.lvl_21 ? [{
            type: INSTRUCTION_TYPE.CONDITION,
            condition: to_ast("$is_greater_or_equal(owner.level,21)"),
            instructions_true: [{
                type: INSTRUCTION_TYPE.SAVE_VARIABLE,
                value: to_ast(damage.lvl_21),
                label: "primary_damage"
            }],
            instructions_false: []
        } as InstructionCondition] : [])
    ]
}

const transform_trigger = (trigger: NonNullable<IRPower["trigger"]>): Trigger => {
    return {
        type: trigger.type,
        intercepts: trigger.intercepts,
        conditions: trigger.conditions.map(x => to_ast(x))
    }
}

const transform_select_target_ir = (props: Omit<IRInstructionSelectTarget, "type" | "target_label">): InstructionSelectTarget => {
    const ir = {
        type: INSTRUCTION_TYPE.SELECT_TARGET,
        target_label: PRIMARY_TARGET_LABEL,
        ...props
    } as IRInstructionSelectTarget

    if (ir.targeting_type === "area_burst")
        return {
            type: INSTRUCTION_TYPE.SELECT_TARGET,
            targeting_type: ir.targeting_type,
            target_type: ir.target_type,
            amount: ir.amount,
            target_label: ir.target_label,
            distance: to_ast(ir.distance),
            radius: ir.radius,
        }
    if (ir.targeting_type === "movement")
        return {
            type: INSTRUCTION_TYPE.SELECT_TARGET,
            targeting_type: ir.targeting_type,
            distance: to_ast(ir.distance),
            target_label: ir.target_label,
            destination_requirement: ir.destination_requirement ? to_ast(ir.destination_requirement) : null,
        }
    if (ir.targeting_type === "ranged")
        return {
            type: INSTRUCTION_TYPE.SELECT_TARGET,
            targeting_type: ir.targeting_type,
            target_type: ir.target_type,
            amount: ir.amount,
            target_label: ir.target_label,
            distance: to_ast(ir.distance),
            exclude: ir.exclude ? ir.exclude.map(x => to_ast(x)) : []
        }
    if (ir.targeting_type === "adjacent" || ir.targeting_type === "melee_weapon")
        return {
            type: INSTRUCTION_TYPE.SELECT_TARGET,
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

const TRIGGER_ACTION_TYPES = [ACTION_TYPE.IMMEDIATE, ACTION_TYPE.OPPORTUNITY, ACTION_TYPE.FREE_ATTACK] as Array<ActionType>