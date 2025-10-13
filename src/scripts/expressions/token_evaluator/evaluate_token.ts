import type {Token} from "scripts/expressions/tokenizer/tokens/AnyToken";
import type {AstNode} from "scripts/expressions/token_evaluator/types";
import {build_evaluate_token_keyword} from "scripts/expressions/token_evaluator/internals/keyword/evaluate_keyword";
import {evaluate_string} from "scripts/expressions/token_evaluator/internals/evaluate_string";
import {evaluate_number} from "scripts/expressions/token_evaluator/internals/evaluate_number";
import {evaluate_weapon} from "scripts/expressions/token_evaluator/internals/evaluate_weapon";
import {evaluate_dice} from "scripts/expressions/token_evaluator/internals/evaluate_dice";
import {build_evaluate_token_function,} from "scripts/expressions/token_evaluator/internals/function/evaluate_function";
import type {NumberToken} from "scripts/expressions/tokenizer/tokens/NumberToken";
import type {StringToken} from "scripts/expressions/tokenizer/tokens/StringToken";
import type {DiceToken, WeaponToken} from "scripts/expressions/tokenizer/tokens/RollToken";
import type {PlayerTurnHandler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import type {KeywordToken} from "scripts/expressions/tokenizer/tokens/KeywordToken";
import type {TokenFunction} from "scripts/expressions/tokenizer/tokens/TokenFunction";

/*
    This is called "evaluate" instead on "interpret" to distinguish the expressions that evaluate to a value from the
    interpreting of instructions that affect the game context.
 */
export const build_evaluate_token = ({player_turn_handler}: { player_turn_handler: PlayerTurnHandler }) => {
    const turn_context = player_turn_handler.turn_context
    const token_evaluator_internals: Record<Token["type"], (token: Token) => AstNode> = {
        "number": (token) => evaluate_number(token as NumberToken),
        "string": (token) => evaluate_string(token as StringToken),
        "weapon": (token) => evaluate_weapon(token as WeaponToken),
        "dice": (token) => evaluate_dice(token as DiceToken),
        "keyword": (token) => {
            const evaluate_token_keyword = build_evaluate_token_keyword({turn_context})
            return evaluate_token_keyword(token as KeywordToken)
        },
        "function": (token) => {
            const evaluate_token_function = build_evaluate_token_function({
                evaluate_token,
                turn_context,
                player_turn_handler
            })
            return evaluate_token_function(token as TokenFunction)
        }

    }
    const evaluate_token = (token: Token) => {
        const func = token_evaluator_internals[token.type]
        if (!func) throw Error(`token evaluator for type '${token.type}' does not exist`)
        return token_evaluator_internals[token.type](token)
    }
    return evaluate_token
}
