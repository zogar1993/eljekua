import {TokenFunction} from "scripts/expressions/tokenizer/tokens/TokenFunction";

export const assert_parameters_amount_equals = (token: TokenFunction, amount: number) => {
    if (token.parameters.length === amount) return
    throw Error(`expected '${amount}' parameters in ${token.name} function, got ${token.parameters.length}`)
}

export const assert_parameters_amount_is_at_least = (token: TokenFunction, amount: number) => {
    if (token.parameters.length >= amount) return
    throw Error(`expected at least '${amount}' parameters in ${token.name} function, got ${token.parameters.length}`)
}
