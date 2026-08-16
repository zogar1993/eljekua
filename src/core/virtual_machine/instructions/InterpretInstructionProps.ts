import type {BattleGrid} from "core/battlegrid/BattleGrid";
import type {TurnState} from "core/battlegrid/player_turn_handler/TurnState";
import type {Expr} from "core/virtual_machine/expressions/types";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {Instruction} from "core/virtual_machine/instructions/instructions";
import {InitiativeOrder} from "core/initiative_order/InitiativeOrder";
import {Settings} from "core/settings/Settings";
import {PlayerTurnHandler} from "core/instruction_loop";

export type InterpretInstructionProps<T extends Instruction> = {
    instruction: T
    player_turn_handler: PlayerTurnHandler
    battle_grid: BattleGrid
    turn_state: TurnState
    evaluate_ast: (node: AstNode) => Expr
    initiative_order: InitiativeOrder
    settings: Settings
}