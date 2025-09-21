import {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";

export const assert_parameters_amount_equals = (token: TokenFunction, amount: number) => {
    if (token.parameters.length === amount) return
    throw Error(`expected '${2}' parameters in ${token.name} function, got ${token.parameters.length}`)
}
