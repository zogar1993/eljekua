import type {AstNodeBoolean, InterpretProps} from "interpreter/types";
import type {TokenFunction} from "tokenizer/tokens/TokenFunction";
import {assert_parameters_amount_equals} from "interpreter/asserts";
import {NODE} from "interpreter/NODE";
import {TOKEN} from "interpreter/TOKEN";
import {interpret_token_string} from "interpreter/specific_interpreters/interpret_token_string";
import {interpret_token_keyword} from "interpreter/specific_interpreters/interpret_token_keyword";

export const interpret_token_function_equipped = ({token, ...props}: InterpretProps<TokenFunction>): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 2)
    const creature = NODE.as_creature(interpret_token_keyword({token: TOKEN.as_keyword(token.parameters[0]), ...props}))
    const text = interpret_token_string({token: TOKEN.as_string(token.parameters[1]), ...props})

    return {
        type: "boolean",
        value: creature.value.has_equipped(text.value),
        description: "equipped",
        params: [creature, text]
    }
}
