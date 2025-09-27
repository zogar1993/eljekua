import type {AstNodeBoolean} from "expressions/token_evaluator/types";
import type {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";
import {assert_parameters_amount_equals} from "expressions/token_evaluator/asserts";
import {TOKEN} from "expressions/token_evaluator/TOKEN";
import type {TurnContext} from "battlegrid/player_turn_handler/TurnContext";

export const evaluate_function_exists = ({token, turn_context}:
                                             {
                                                 token: TokenFunction,
                                                 turn_context: TurnContext
                                             }): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 1)
    const parameter = TOKEN.as_keyword(token.parameters[0])

    return {
        type: "boolean",
        value: turn_context.get_current_context().has_variable(parameter.value),
        description: `exists ${parameter.value}`,
    }
}
