import type {ExprBoolean} from "scripts/expressions/token_evaluator/types";
import type {TokenFunction} from "scripts/expressions/tokenizer/tokens/TokenFunction";
import {assert_parameters_amount_equals} from "scripts/expressions/token_evaluator/asserts";
import {TOKEN} from "scripts/expressions/token_evaluator/TOKEN";
import type {TurnContext} from "scripts/battlegrid/player_turn_handler/TurnContext";

export const evaluate_function_exists = ({token, turn_context}:
                                             {
                                                 token: TokenFunction,
                                                 turn_context: TurnContext
                                             }): ExprBoolean => {
    assert_parameters_amount_equals(token, 1)
    const parameter = TOKEN.as_keyword(token.parameters[0])

    return {
        type: "boolean",
        value: turn_context.get_current_context().has_variable(parameter.value),
        description: `exists ${parameter.value}`,
    }
}
