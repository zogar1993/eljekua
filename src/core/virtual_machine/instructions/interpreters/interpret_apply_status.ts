import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {
    add_creature_status,
    type Creature,
    type StatusDuration,
    type StatusEffect
} from "core/battlegrid/creatures/Creature";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {Expr} from "core/virtual_machine/expressions/types";
import type {InstructionApplyStatus} from "core/virtual_machine/instructions/instructions";

export const interpret_apply_status = ({
                                           instruction,
                                           game_state,
                                           evaluate_ast,
                                       }: InterpretInstructionProps<InstructionApplyStatus>) => {
    const {vm_state} = game_state
    const targets = EXPR.as_creatures(evaluate_ast(instruction.target))
    const power_owner = vm_state.get_acting_creature()

    for (const target of targets)
        add_creature_status({
            creature: target,
            status: interpret_status_effect({instruction, evaluate_ast, power_owner})
        })
}

const interpret_status_effect = ({instruction, evaluate_ast, power_owner}: {
    instruction: InstructionApplyStatus,
    power_owner: Creature,
    evaluate_ast: (node: AstNode) => Expr
}) => ({
    effect: interpret_status({status: instruction.status, evaluate_ast}),
    durations: interpret_duration({duration: instruction.duration, power_owner})
})

const interpret_duration = ({duration, power_owner}: {
    duration: InstructionApplyStatus["duration"],
    power_owner: Creature
}): Array<StatusDuration> => {
    return duration.map(duration => {
        switch (duration) {
            case "until_start_of_your_next_turn":
                return {
                    until: "turn_start",
                    creature: power_owner
                }
            case "until_start_of_next_turn":
                return {
                    until: "turn_start"
                }
            case "until_end_of_your_next_turn":
                return {
                    until: "next_turn_end",
                    creature: power_owner
                }
            case "until_your_next_attack_roll_against_target":
                return {
                    until: "next_attack_roll_against_target",
                    creature: power_owner
                }
            default:
                throw Error(`duration '${duration}' not supported`)
        }
    })
}

const interpret_status = ({status, evaluate_ast}: {
    status: InstructionApplyStatus["status"],
    evaluate_ast: (node: AstNode) => Expr
}): StatusEffect => {
    switch (status.type) {
        case "grant_combat_advantage":
            return {
                type: "grant_combat_advantage",
                against: EXPR.as_creatures(evaluate_ast(status.against))
            }
        case "gain_attack_bonus":
            return {
                type: "gain_attack_bonus",
                against: EXPR.as_creatures(evaluate_ast(status.against)),
                value: EXPR.as_number_resolved_expr(evaluate_ast(status.value))
            }
        case "gain_resistance":
            return {
                type: "gain_resistance",
                against: EXPR.as_creatures(evaluate_ast(status.against)),
                value: EXPR.as_number_resolved_expr(evaluate_ast(status.value))
            }
        default:
            throw Error(`could not interpret status '${JSON.stringify(status)}'`)
    }
}
