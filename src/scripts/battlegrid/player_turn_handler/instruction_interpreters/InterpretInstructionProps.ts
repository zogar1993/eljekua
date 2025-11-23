import type {Instruction} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import type {PowerContext} from "scripts/battlegrid/player_turn_handler/PowerContext";
import type {PlayerTurnHandler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import type {BattleGrid} from "scripts/battlegrid/BattleGrid";
import type {ActionLog} from "scripts/action_log/ActionLog";
import type {TurnContext} from "scripts/battlegrid/player_turn_handler/TurnContext";
import type {Expr} from "scripts/expressions/token_evaluator/types";
import type {Token} from "scripts/expressions/tokenizer/tokens/AnyToken";

export type InterpretInstructionProps<T extends Instruction> = {
    instruction: T
    context: PowerContext
    player_turn_handler: PlayerTurnHandler
    battle_grid: BattleGrid
    action_log: ActionLog
    turn_context: TurnContext
    evaluate_token: (token: Token) => Expr
}