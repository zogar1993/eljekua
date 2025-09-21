import {Instruction} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";
import {PlayerTurnHandler} from "battlegrid/player_turn_handler/PlayerTurnHandler";
import {BattleGrid} from "battlegrid/BattleGrid";
import {ActionLog} from "action_log/ActionLog";
import {TurnContext} from "battlegrid/player_turn_handler/TurnContext";

export type InterpretInstructionProps<T extends Instruction> = {
    instruction: T
    context: PowerContext
    player_turn_handler: PlayerTurnHandler
    battle_grid: BattleGrid
    action_log: ActionLog
    turn_context: TurnContext
}