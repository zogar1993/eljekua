import type {Instruction} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import type {PowerContext} from "battlegrid/player_turn_handler/PowerContext";
import type {PlayerTurnHandler} from "battlegrid/player_turn_handler/PlayerTurnHandler";
import type {BattleGrid} from "battlegrid/BattleGrid";
import type {ActionLog} from "action_log/ActionLog";
import type {TurnContext} from "battlegrid/player_turn_handler/TurnContext";
import type {AstNode} from "expressions/token_evaluator/types";
import type {Token} from "expressions/tokenizer/tokens/AnyToken";

export type InterpretInstructionProps<T extends Instruction> = {
    instruction: T
    context: PowerContext
    player_turn_handler: PlayerTurnHandler
    battle_grid: BattleGrid
    action_log: ActionLog
    turn_context: TurnContext
    evaluate_token: (token: Token) => AstNode
}