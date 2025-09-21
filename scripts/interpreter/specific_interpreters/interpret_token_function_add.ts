import type {AstNodeNumber, InterpretProps} from "interpreter/types";
import type {TokenFunction} from "tokenizer/tokens/TokenFunction";
import {add_numbers, add_numbers_resolved, is_number, is_number_resolved} from "interpreter/add_numbers";
import {interpret_token} from "interpreter/interpret_token";

export const interpret_token_function_add = ({token, ...props}: InterpretProps<TokenFunction>): AstNodeNumber => {
    const params = token.parameters.map(parameter => interpret_token({token: parameter, ...props}))

    if (params.every(is_number_resolved))
        return add_numbers_resolved(params)

    if (params.every(is_number))
        return add_numbers(params)

    throw Error(`not all params evaluate to numbers on add function`)
}