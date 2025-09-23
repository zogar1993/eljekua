import type {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";
import {evaluate_token} from "expressions/token_evaluator/evaluate_token";
import type {AstNodeBoolean, InterpretProps} from "expressions/token_evaluator/types";
import {assert_parameters_amount_is_at_least} from "expressions/token_evaluator/asserts";

export const evaluate_token_function_or = ({
                                               token,
                                               ...props
                                           }: InterpretProps<TokenFunction>): AstNodeBoolean => {
    assert_parameters_amount_is_at_least(token, 2)

    const parameters = token.parameters.map(parameter => evaluate_token({token: parameter, ...props}))

    if (!parameters.every(parameter => parameter.type === "boolean"))
        throw Error(`Expected all '$or()' parameters to evaluate to booleans, but found '${JSON.stringify(parameters)}'`)

    let result
    for (const parameter of parameters)
        if (parameter.value)
            result = true
    result = false

    return {
        type: "boolean",
        value: result,
        description: "not_equals",
        params: parameters
    }
}