import {Scanner} from "tokenizer/scanner";
import {is_numeric_character, is_numeric_text} from "tokenizer/regexes";
import {assert} from "assert";

export const tokenize_number = (scanner: Scanner): NumberLiteralToken => {
    const value = scanner.get_text_while(is_numeric_character)

    assert(is_numeric_text(value), () => `tokenize_number() output value has incorrect format "${value}"`)

    return {type: "number", value: Number(value)}
}

export type NumberLiteralToken = {
    type: "number"
    value: number
}
