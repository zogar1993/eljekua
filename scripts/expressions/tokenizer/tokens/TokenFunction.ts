import {Scanner} from "expressions/tokenizer/scanner";
import {is_text_character} from "expressions/tokenizer/regexes";
import {assert} from "assert";
import {Token, tokenize_any} from "expressions/tokenizer/tokens/AnyToken";

export const tokenize_function = (scanner: Scanner): TokenFunction => {
    scanner.consume("$")

    const name = scanner.get_text_while(is_text_character)

    assert(FUNCTION_NAMES.includes(name), () => `function name '${name}' does not exist. Tokenizing ${scanner.text}`)
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

const FUNCTION_NAMES = [
    "exists",
    "or",
    "and",
    "add",
    "greater_or_equals",
    "not_equals",
    "equipped",
    "has_valid_targets",
    "lvl_damage"
]

export type TokenFunction = {
    type: "function"
    name: string
    parameters: Array<Token>
}
