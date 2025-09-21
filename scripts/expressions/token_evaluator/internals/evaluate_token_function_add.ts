import type {AstNodeNumber, InterpretProps} from "expressions/token_evaluator/types";
import type {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";
import {add_numbers, add_numbers_resolved, is_number, is_number_resolved} from "expressions/token_evaluator/add_numbers";
import {evaluate_token} from "expressions/token_evaluator/evaluate_token";

export const evaluate_token_function_add = ({token, ...props}: InterpretProps<TokenFunction>): AstNodeNumber => {
    const params = token.parameters.map(parameter => evaluate_token({token: parameter, ...props}))

    if (params.every(is_number_resolved))
        return add_numbers_resolved(params)

    if (params.every(is_number))
        return add_numbers(params)

    throw Error(`not all params evaluate to numbers on add function`)
}