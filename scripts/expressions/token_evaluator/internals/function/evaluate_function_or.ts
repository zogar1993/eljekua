import type {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";
import type {AstNodeBoolean} from "expressions/token_evaluator/types";
import {assert_parameters_amount_is_at_least} from "expressions/token_evaluator/asserts";
import type {Token} from "expressions/tokenizer/tokens/AnyToken";
import type {AstNode} from "expressions/token_evaluator/types";

export const evaluate_function_or = ({token, evaluate_token}:
                                         {
                                             token: TokenFunction
                                             evaluate_token: (token: Token) => AstNode
                                         }): AstNodeBoolean => {
    assert_parameters_amount_is_at_least(token, 2)

    const parameters = token.parameters.map(evaluate_token)

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