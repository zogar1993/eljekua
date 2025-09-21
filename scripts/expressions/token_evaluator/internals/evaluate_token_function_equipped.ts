import type {AstNodeBoolean, InterpretProps} from "expressions/token_evaluator/types";
import type {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";
import {assert_parameters_amount_equals} from "expressions/token_evaluator/asserts";
import {NODE} from "expressions/token_evaluator/NODE";
import {TOKEN} from "expressions/token_evaluator/TOKEN";
import {evaluate_token_string} from "expressions/token_evaluator/internals/evaluate_token_string";
import {evaluate_token_keyword} from "expressions/token_evaluator/internals/evaluate_token_keyword";

export const evaluate_token_function_equipped = ({token, ...props}: InterpretProps<TokenFunction>): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 2)
    const creature = NODE.as_creature(evaluate_token_keyword({token: TOKEN.as_keyword(token.parameters[0]), ...props}))
    const text = evaluate_token_string({token: TOKEN.as_string(token.parameters[1]), ...props})

    return {
        type: "boolean",
        value: creature.value.has_equipped(text.value),
        description: "equipped",
        params: [creature, text]
    }
}
