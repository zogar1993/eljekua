import type {Expr} from "core/virtual_machine/expressions/types";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {Instruction} from "core/virtual_machine/instructions/instructions";
import {PlayerTurnHandler} from "core/instruction_loop";
import {GameEvents} from "core/events/GameEvents";
import type {GameState} from "core/game_state/GameState";

export type InterpretInstructionProps<T extends Instruction> = {
    instruction: T
    player_turn_handler: PlayerTurnHandler
    game_state: GameState
    evaluate_ast: (node: AstNode) => Expr
    game_events: GameEvents
}