import {Scanner} from "tokenizer/scanner";
import {is_text_character} from "tokenizer/regexes";
import {assert} from "assert";

import {Token, tokenize_any} from "tokenizer/tokens/AnyToken";

export const tokenize_string = (scanner: Scanner): StringToken => {
    scanner.consume(`"`)

    const value = scanner.get_text_while((char: string) => char !== `"`)

    scanner.consume(`"`)

    return {
        type: "string",
        value: value
    }
}

export type StringToken = {
    type: "string"
    value: string
}
