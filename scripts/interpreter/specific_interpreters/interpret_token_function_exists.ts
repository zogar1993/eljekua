import type {AstNodeBoolean, InterpretProps} from "interpreter/types";
import type {TokenFunction} from "tokenizer/tokens/TokenFunction";
import {assert_parameters_amount_equals} from "interpreter/asserts";
import {TOKEN} from "interpreter/TOKEN";

export const interpret_token_function_exists = ({token, player_turn_handler}: InterpretProps<TokenFunction>): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 1)
    const parameter = TOKEN.as_keyword(token.parameters[0])

    return {
        type: "boolean",
        value: player_turn_handler.turn_context.get_current_context().has_variable(parameter.value),
        description: `exists ${parameter.value}`,
    }
}
