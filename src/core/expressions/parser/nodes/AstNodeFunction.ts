import type {Scanner} from "core/expressions/parser/scanner";
import {is_text_character} from "core/expressions/parser/regexes";
import {assert, assert_is_included} from "stdlib/assert";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {parse_any} from "core/expressions/parser/nodes/AstNode";
import {FUNCTION_NAMES} from "core/expressions/function_names";

export const parse_function = (scanner: Scanner): AstNodeFunction => {
    scanner.consume("$")

    const name = scanner.get_text_while(is_text_character)
    assert_is_included(name, FUNCTION_NAMES)

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

export type AstNodeFunction = {
    type: "function"
    name: string
    parameters: Array<AstNode>
}