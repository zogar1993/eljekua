import {
    interpret_instruction
} from "core/battlegrid/player_turn_handler/instruction_interpreters/interpret_instruction";
import {PlayerTurnHandler} from "core/battlegrid/player_turn_handler/PlayerTurnHandler";
import {TurnState} from "core/battlegrid/player_turn_handler/TurnState";
import {BattleGrid} from "core/battlegrid/BattleGrid";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {Expr} from "core/expressions/evaluator/types";
import {InitiativeOrder} from "core/initiative_order/InitiativeOrder";
import {Settings} from "core/settings/Settings";

//TODO see if we can go back to the syncronous loop
export const create_instruction_loop = ({
                                           player_turn_handler,
                                           turn_state,
                                           battle_grid,
                                           evaluate_ast,
                                           initiative_order,
                                           settings
                                       }: {
    player_turn_handler: PlayerTurnHandler
    turn_state: TurnState
    battle_grid: BattleGrid
    evaluate_ast: (node: AstNode) => Expr
    initiative_order: InitiativeOrder
    settings: Settings
}) => {
    const evaluate_instructions = () => {
        while (player_turn_handler.get_interaction() === null) {
            const instruction = turn_state.next_instruction()

            if (instruction === null) {
                player_turn_handler.set_action_selection_for_current_character();
            } else {
                interpret_instruction({
                    instruction,
                    player_turn_handler,
                    battle_grid,
                    turn_state,
                    evaluate_ast,
                    initiative_order,
                    settings
                })
            }
        }
    }

    const run_logical_frame_with_delay_recursion = () => {
        evaluate_instructions()
        setTimeout(run_logical_frame_with_delay_recursion, 20)
    }

    return {
        run: run_logical_frame_with_delay_recursion
    }
}

export type InstructionLoop = ReturnType<typeof create_instruction_loop>