import {AstNode} from "expressions/token_evaluator/types";
import {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";
import {evaluate_function_add} from "expressions/token_evaluator/internals/function/evaluate_function_add";
import {evaluate_function_equipped} from "expressions/token_evaluator/internals/function/evaluate_function_equipped";
import {
    evaluate_function_not_equals
} from "expressions/token_evaluator/internals/function/evaluate_function_not_equals";
import {
    evaluate_function_has_valid_targets
} from "expressions/token_evaluator/internals/function/evaluate_function_has_valid_targets";
import {evaluate_function_or} from "expressions/token_evaluator/internals/function/evaluate_function_or";
import type {Token} from "expressions/tokenizer/tokens/AnyToken";
import type {TurnContext} from "battlegrid/player_turn_handler/TurnContext";
import {evaluate_function_exists} from "expressions/token_evaluator/internals/function/evaluate_function_exists";
import type {PlayerTurnHandler} from "battlegrid/player_turn_handler/PlayerTurnHandler";
import {
    evaluate_function_is_greater_or_equal
} from "expressions/token_evaluator/internals/function/evaluate_function_is_greater_or_equal";

export const build_evaluate_token_function = ({evaluate_token, turn_context, player_turn_handler}:
                                                  {
                                                      evaluate_token: (token: Token) => AstNode,
                                                      turn_context: TurnContext,
                                                      player_turn_handler: PlayerTurnHandler
                                                  }
) => {
    return (token: TokenFunction): AstNode => {
        switch (token.name) {
            case "add":
                return evaluate_function_add({token, evaluate_token})
            case "exists":
                return evaluate_function_exists({token, turn_context})
            case "equipped":
                return evaluate_function_equipped({token, evaluate_token})
            case "not_equals":
                return evaluate_function_not_equals({token, evaluate_token})
            case "has_valid_targets":
                return evaluate_function_has_valid_targets({token, turn_context, player_turn_handler})
            case "or":
                return evaluate_function_or({token, evaluate_token})
            case "is_greater_or_equal":
                return evaluate_function_is_greater_or_equal({token, evaluate_token})
            default:
                throw Error(`function name '${token.name}' not supported when evaluating token`)
        }
    }
}