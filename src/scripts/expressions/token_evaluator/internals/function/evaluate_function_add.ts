import type {AstNodeNumber} from "scripts/expressions/token_evaluator/types";
import type {TokenFunction} from "scripts/expressions/tokenizer/tokens/TokenFunction";
import {
    number_utils,
    add_numbers_resolved,
    is_number,
    is_number_resolved
} from "scripts/expressions/token_evaluator/number_utils";
import type {Token} from "scripts/expressions/tokenizer/tokens/AnyToken";
import type {AstNode} from "scripts/expressions/token_evaluator/types";

export const evaluate_function_add = ({token, evaluate_token}:
                                                {
                                                    token: TokenFunction,
                                                    evaluate_token: (token: Token) => AstNode,
                                                }): AstNodeNumber => {
    const params = token.parameters.map(evaluate_token)

    if (params.every(is_number_resolved))
        return add_numbers_resolved(params)

    if (params.every(is_number))
        return number_utils(params)

    throw Error(`not all params evaluate to numbers on add function`)
}