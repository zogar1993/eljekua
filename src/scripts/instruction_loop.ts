import {
    interpret_instruction
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_instruction";
import {PlayerTurnHandler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import {TurnState} from "scripts/battlegrid/player_turn_handler/TurnState";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import type {Expr} from "scripts/expressions/evaluator/types";
import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";
import {ActionLog} from "scripts/action_log/ActionLog";
import {InstructionVisualizer} from "scripts/instruction_visualizer/instruction_visualizer";
import {GameplayUseCases} from "scripts/use_cases/gameplay/gameplay_use_cases";

export const create_instruction_loop = ({
                                           player_turn_handler,
                                           turn_state,
                                           battle_grid,
                                           action_log,
                                           evaluate_ast,
                                           initiative_order,
                                           instruction_visualizer,
                                           gameplay_use_cases,
                                       }: {
    player_turn_handler: PlayerTurnHandler
    turn_state: TurnState
    battle_grid: BattleGrid
    action_log: ActionLog
    evaluate_ast: (node: AstNode) => Expr
    initiative_order: InitiativeOrder
    instruction_visualizer: InstructionVisualizer
    gameplay_use_cases: GameplayUseCases
}) => {
    const evaluate_instructions = () => {
        while (player_turn_handler.get_selection_context() === null) {
            instruction_visualizer.show(turn_state)
            const instruction = turn_state.next_instruction()

            if (instruction === null) {
                player_turn_handler.set_action_selection_for_current_character();
            } else {
                interpret_instruction({
                    instruction,
                    player_turn_handler,
                    battle_grid,
                    action_log,
                    turn_state,
                    evaluate_ast,
                    initiative_order,
                    gameplay_use_cases
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