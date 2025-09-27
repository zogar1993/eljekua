import type {AstNodeNumber} from "expressions/token_evaluator/types";
import type {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";
import {
    add_numbers,
    add_numbers_resolved,
    is_number,
    is_number_resolved
} from "expressions/token_evaluator/add_numbers";
import type {Token} from "expressions/tokenizer/tokens/AnyToken";
import type {AstNode} from "expressions/token_evaluator/types";

export const evaluate_function_add = ({token, evaluate_token}:
                                                {
                                                    token: TokenFunction,
                                                    evaluate_token: (token: Token) => AstNode,
                                                }): AstNodeNumber => {
    const params = token.parameters.map(evaluate_token)

    if (params.every(is_number_resolved))
        return add_numbers_resolved(params)

    if (params.every(is_number))
        return add_numbers(params)

    throw Error(`not all params evaluate to numbers on add function`)
}