import type {
    InstructionApplyStatus
} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import type {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE} from "scripts/expressions/token_evaluator/NODE";
import type {PlayerTurnHandler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import type {StatusDuration, StatusEffect} from "scripts/battlegrid/creatures/Creature";
import {Token} from "scripts/expressions/tokenizer/tokens/AnyToken";
import {AstNode} from "scripts/expressions/token_evaluator/types";

export const interpret_apply_status = ({
                                           instruction,
                                           player_turn_handler,
                                           evaluate_token,
                                       }: InterpretInstructionProps<InstructionApplyStatus>) => {
    const creatures = NODE.as_creatures(evaluate_token(instruction.target))

    for (const creature of creatures)
        creature.add_status({
            effect: interpret_status({status: instruction.status, evaluate_token}),
            durations: interpret_duration({duration: instruction.duration, player_turn_handler})
        })
}

const interpret_duration = (
    {duration, player_turn_handler}:
        {
            duration: InstructionApplyStatus["duration"],
            player_turn_handler: PlayerTurnHandler
        }): Array<StatusDuration> => {
    const owner = player_turn_handler.turn_context.get_current_context().owner()
    return duration.map(duration => {
        switch (duration) {
            case "until_start_of_your_next_turn":
                return {
                    until: "turn_start",
                    creature: owner
                }
            case "until_start_of_next_turn":
                return {
                    until: "turn_start"
                }
            case "until_end_of_your_next_turn":
                return {
                    until: "next_turn_end",
                    creature: owner
                }
            case "until_your_next_attack_roll_against_target":
                return {
                    until: "next_attack_roll_against_target",
                    creature: owner
                }
            default:
                throw Error(`duration '${duration}' not supported`)
        }
    })
}

const interpret_status = (
    {status, evaluate_token}:
        {
            status: InstructionApplyStatus["status"],
            evaluate_token: (token: Token) => AstNode
        }
): StatusEffect => {
    switch (status.type) {
        case "grant_combat_advantage":
            return {
                type: "grant_combat_advantage",
                against: NODE.as_creatures(evaluate_token(status.against))
            }
        case "gain_attack_bonus":
            return {
                type: "gain_attack_bonus",
                against: NODE.as_creatures(evaluate_token(status.against)),
                value: NODE.as_number_resolved(evaluate_token(status.value))
            }
        case "gain_resistance":
            return {
                type: "gain_resistance",
                against: NODE.as_creatures(evaluate_token(status.against)),
                value: NODE.as_number_resolved(evaluate_token(status.value))
            }
        case "opportunity_action_used":
            return {
                type: "opportunity_action_used",
            }
        default:
            throw Error(`could not interpret status '${JSON.stringify(status)}'`)
    }
}
