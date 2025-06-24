import {Scanner} from "tokenizer/scanner";
import {is_text_character} from "tokenizer/regexes";
import {assert} from "assert";

import {Token, tokenize_any} from "tokenizer/tokens/AnyToken";

export const tokenize_function = (scanner: Scanner): FunctionToken => {
    scanner.consume("$")

    const name = scanner.get_text_while(is_text_character)

    assert(["sum", "exists"].includes(name), () => `function name '${name}' does not exist. Tokenizing ${scanner.text}`)
    scanner.consume("(")

    const parameters = []
    const MAX_PARAMS_ALLOWED = 8
    let current_params = 0
    while (true) {
        assert(current_params < MAX_PARAMS_ALLOWED, () => `maximum number of parameters exceeded`)
        current_params++
        const param = tokenize_any(scanner)
        parameters.push(param)
        if (scanner.peek() === ")") break
        scanner.consume(",")
    }

    scanner.consume(")")

    return {
        type: "function",
        name,
        parameters
    }
}

export type FunctionToken = {
    type: "function"
    name: string
    parameters: Array<Token>
}
