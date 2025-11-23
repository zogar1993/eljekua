import type {TokenFunction} from "scripts/expressions/tokenizer/tokens/TokenFunction";
import type {ExprBoolean} from "scripts/expressions/token_evaluator/types";
import {assert_parameters_amount_equals} from "scripts/expressions/token_evaluator/asserts";
import type {Token} from "scripts/expressions/tokenizer/tokens/AnyToken";
import type {Expr} from "scripts/expressions/token_evaluator/types";
import {EXPR} from "scripts/expressions/token_evaluator/EXPR";

export const evaluate_function_is_greater_or_equal = ({token, evaluate_token}:
                                                          {
                                                              token: TokenFunction
                                                              evaluate_token: (token: Token) => Expr
                                                          }): ExprBoolean => {
    assert_parameters_amount_equals(token, 2)

    const parameters = token.parameters.map(evaluate_token)

    const a = EXPR.as_number_resolved(parameters[0])
    const b = EXPR.as_number_resolved(parameters[1])
    return {
        type: "boolean",
        value: a.value >= b.value,
        description: ">=",
        params: parameters
    }
}