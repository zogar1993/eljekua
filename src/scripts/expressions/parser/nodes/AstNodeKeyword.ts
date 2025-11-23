import {Scanner} from "scripts/expressions/parser/scanner";
import {is_plain_text, is_text_character} from "scripts/expressions/parser/regexes";
import {assert} from "scripts/assert";

export const parse_keyword = (scanner: Scanner): AstNodeKeyword => {
    const value = scanner.get_text_while(is_text_character)

    assert(is_plain_text(value), () => `expected plain text, found "${value}"`)

    const keyword: AstNodeKeyword = {type: "keyword", value}
    if (scanner.peek() === ".") {
        scanner.consume(".")

        const value = scanner.get_text_while(is_text_character)

        assert(is_plain_text(value), () => `expected plain text, found "${value}"`)
        keyword.property = value
    }

    return keyword
}

export type AstNodeKeyword = {
    type: "keyword"
    value: string
    property?: string
}