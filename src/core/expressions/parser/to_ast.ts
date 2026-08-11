import {assert} from "stdlib/assert";
import {Scanner} from "core/expressions/parser/scanner";
import {AstNode, parse_any} from "core/expressions/parser/nodes/AstNode";

export const to_ast = (value: string | number): AstNode => {
    const text = `${value}`
    const scanner = new Scanner(text)
    const node = parse_any(scanner)
    assert(scanner.is_at_end(), () => `expected end of formula but found more text on ${text}`)
    return node
}
