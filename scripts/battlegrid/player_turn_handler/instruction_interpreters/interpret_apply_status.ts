import type {
    InstructionApplyStatus
} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import type {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {evaluate_token, evaluate_token_to_creatures} from "expressions/token_evaluator/evaluate_token";
import {NODE} from "expressions/token_evaluator/NODE";
import type {PlayerTurnHandler} from "battlegrid/player_turn_handler/PlayerTurnHandler";
import type {StatusDuration, StatusEffect} from "battlegrid/creatures/Creature";

export const interpret_apply_status = ({
                                           instruction,
                                           player_turn_handler
                                       }: InterpretInstructionProps<InstructionApplyStatus>) => {
    const target = NODE.as_creature(evaluate_token({token: instruction.target, player_turn_handler})).value
    const durations = interpret_duration({duration: instruction.duration, player_turn_handler})

    target.add_status({
        effect: interpret_status({status: instruction.status, player_turn_handler}),
        durations
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
            case "until_end_of_your_next_turn":
                return {
                    until: "turn_end",
                    creature: owner,
                    bypass_this_turn: owner === player_turn_handler.initiative_order.get_current_creature()
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
    {status, player_turn_handler}:
        { status: InstructionApplyStatus["status"], player_turn_handler: PlayerTurnHandler }
): StatusEffect => {
    switch (status.type) {
        case "grant_combat_advantage":
            return {
                type: "grant_combat_advantage",
                against: evaluate_token_to_creatures({token: status.against, player_turn_handler})
            }
        case "gain_attack_bonus":
            return {
                type: "gain_attack_bonus",
                against: evaluate_token_to_creatures({token: status.against, player_turn_handler}),
                value: NODE.as_number_resolved(evaluate_token({token: status.value, player_turn_handler}))
            }
        case "gain_resistance":
            return {
                type: "gain_resistance",
                against: evaluate_token_to_creatures({token: status.against, player_turn_handler}),
                value: NODE.as_number_resolved(evaluate_token({token: status.value, player_turn_handler}))
            }
        default:
            throw Error(`could not interpret status '${JSON.stringify(status)}'`)
    }
}
