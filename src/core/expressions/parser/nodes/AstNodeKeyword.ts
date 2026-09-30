import type {Scanner} from "core/expressions/parser/scanner";
import {is_plain_text, is_text_character} from "core/expressions/parser/regexes";
import {assert} from "stdlib/assert";

export const parse_keyword = (scanner: Scanner): AstNodeKeyword => {
    const value = scanner.get_text_while(is_text_character)

    assert(is_plain_text(value), () => `expected plain text, found "${value}"`)

    return {type: "keyword", value}
}

export type AstNodeKeyword = {
    type: "keyword"
    value: string
}
