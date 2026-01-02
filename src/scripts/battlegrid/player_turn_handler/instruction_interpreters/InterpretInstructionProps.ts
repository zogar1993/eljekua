import type {PlayerTurnHandler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import type {BattleGrid} from "scripts/battlegrid/BattleGrid";
import type {ActionLog} from "scripts/action_log/ActionLog";
import type {TurnState} from "scripts/battlegrid/player_turn_handler/TurnState";
import type {Expr} from "scripts/expressions/evaluator/types";
import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {Instruction} from "scripts/expressions/parser/instructions";
import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";

export type InterpretInstructionProps<T extends Instruction> = {
    instruction: T
    player_turn_handler: PlayerTurnHandler
    battle_grid: BattleGrid
    action_log: ActionLog
    turn_state: TurnState
    evaluate_ast: (node: AstNode) => Expr
    initiative_order: InitiativeOrder
}