import {Token} from "tokenizer/tokens/AnyToken";
import {PlayerTurnHandler} from "battlegrid/player_turn_handler/PlayerTurnHandler";

export type InterpretProps<T extends Token> = {
    token: T,
    player_turn_handler: PlayerTurnHandler
}