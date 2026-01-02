import {Scanner} from "scripts/expressions/parser/scanner";
import {is_text_character} from "scripts/expressions/parser/regexes";
import {assert} from "scripts/assert";
import {AstNode, parse_any} from "scripts/expressions/parser/nodes/AstNode";

export const parse_function = (scanner: Scanner): AstNodeFunction => {
    scanner.consume("$")

    const name = scanner.get_text_while(is_text_character)

    assert(FUNCTION_NAMES.includes(name), () => `function name '${name}' does not exist. Parsing ${scanner.text}`)
    scanner.consume("(")

    const parameters = []
    const MAX_PARAMS_ALLOWED = 8
    let current_params = 0
    while (true) {
        assert(current_params < MAX_PARAMS_ALLOWED, () => `maximum number of parameters exceeded`)
        current_params++
        const param = parse_any(scanner)
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
    "is_greater_or_equal",
    "not_equals",
    "equipped",
    "has_valid_targeting"
]

export type AstNodeFunction = {
    type: "function"
    name: string
    parameters: Array<AstNode>
}