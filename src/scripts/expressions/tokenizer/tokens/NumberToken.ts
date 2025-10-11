import {Scanner} from "scripts/expressions/tokenizer/scanner";
import {is_numeric_character, is_numeric_text} from "scripts/expressions/tokenizer/regexes";
import {assert} from "scripts/assert";

export const tokenize_number = (scanner: Scanner): NumberToken => {
    const value = scanner.get_text_while(is_numeric_character)

    assert(is_numeric_text(value), () => `tokenize_number() output value has incorrect format "${value}"`)

    return {type: "number", value: Number(value)}
}

export type NumberToken = {
    type: "number"
    value: number
}
