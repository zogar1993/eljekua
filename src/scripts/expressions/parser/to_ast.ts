import {assert} from "scripts/assert";
import {Scanner} from "scripts/expressions/parser/scanner";
import {AstNode, parse_any} from "scripts/expressions/parser/nodes/AstNode";

export const to_ast = (value: string | number): AstNode => {
    const text = `${value}`
    const scanner = new Scanner(text)
    const node = parse_any(scanner)
    assert(scanner.is_at_end(), () => `expected end of formula but found more text on ${text}`)
    return node
}
