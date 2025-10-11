import {Scanner} from "scripts/expressions/tokenizer/scanner";
import {is_plain_text, is_text_character} from "scripts/expressions/tokenizer/regexes";
import {assert} from "scripts/assert";

export const tokenize_keyword = (scanner: Scanner): KeywordToken => {
    const value = scanner.get_text_while(is_text_character)

    assert(is_plain_text(value), () => `tokenize_text() output value has incorrect format "${value}"`)

    const keyword: KeywordToken = {type: "keyword", value}
    if (scanner.peek() === ".") {
        scanner.consume(".")

        const value = scanner.get_text_while(is_text_character)

        assert(is_plain_text(value), () => `tokenize_text() output value has incorrect format "${value}"`)
        keyword.property = value
    }

    return keyword
}

export type KeywordToken = {
    type: "keyword"
    value: string
    property?: string
}
