import {Scanner} from "core/expressions/parser/scanner";
import {is_numeric_character, is_numeric_text} from "core/expressions/parser/regexes";
import {assert} from "stdlib/assert";

export const parse_number = (scanner: Scanner): AstNodeNumber => {
    const value = scanner.get_text_while(is_numeric_character)

    assert(is_numeric_text(value), () => `expected numeric text, found "${value}"`)

    return {type: "number", value: Number(value)}
}

export type AstNodeNumber = {
    type: "number"
    value: number
}