import type {TokenFunction} from "scripts/expressions/tokenizer/tokens/TokenFunction";
import type {AstNodeBoolean} from "scripts/expressions/token_evaluator/types";
import {assert_parameters_amount_equals} from "scripts/expressions/token_evaluator/asserts";
import type {Token} from "scripts/expressions/tokenizer/tokens/AnyToken";
import type {AstNode} from "scripts/expressions/token_evaluator/types";
import {NODE} from "scripts/expressions/token_evaluator/NODE";

export const evaluate_function_is_greater_or_equal = ({token, evaluate_token}:
                                                          {
                                                              token: TokenFunction
                                                              evaluate_token: (token: Token) => AstNode
                                                          }): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 2)

    const parameters = token.parameters.map(evaluate_token)

    const a = NODE.as_number_resolved(parameters[0])
    const b = NODE.as_number_resolved(parameters[1])
    return {
        type: "boolean",
        value: a.value >= b.value,
        description: ">=",
        params: parameters
    }
}