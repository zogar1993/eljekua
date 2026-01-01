import type {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import type {PlayerTurnHandler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import type {StatusDuration, StatusEffect} from "scripts/battlegrid/creatures/Creature";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {Expr} from "scripts/expressions/evaluator/types";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {InstructionApplyStatus} from "scripts/expressions/parser/instructions";

export const interpret_apply_status = ({
                                           instruction,
                                           turn_state,
                                           evaluate_ast,
                                       }: InterpretInstructionProps<InstructionApplyStatus>) => {
    const targets = EXPR.as_creatures(evaluate_ast(instruction.target))
    const power_owner = turn_state.get_power_owner()
    
    for (const target of targets)
        target.add_status({
            effect: interpret_status({status: instruction.status, evaluate_ast}),
            durations: interpret_duration({duration: instruction.duration, power_owner})
        })
}

const interpret_duration = (
    {duration, power_owner}:
        {
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

const interpret_status = (
    {status, evaluate_ast}:
        {
            status: InstructionApplyStatus["status"],
            evaluate_ast: (node: AstNode) => Expr
        }
): StatusEffect => {
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
