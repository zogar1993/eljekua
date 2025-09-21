import type {AstNodeBoolean, InterpretProps} from "expressions/token_evaluator/types";
import type {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";
import {assert_parameters_amount_equals} from "expressions/token_evaluator/asserts";
import {TOKEN} from "expressions/token_evaluator/TOKEN";

export const evaluate_token_function_exists = ({token, player_turn_handler}: InterpretProps<TokenFunction>): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 1)
    const parameter = TOKEN.as_keyword(token.parameters[0])

    return {
        type: "boolean",
        value: player_turn_handler.turn_context.get_current_context().has_variable(parameter.value),
        description: `exists ${parameter.value}`,
    }
}
