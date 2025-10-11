import {Token} from "scripts/expressions/tokenizer/tokens/AnyToken";
import {KeywordToken} from "scripts/expressions/tokenizer/tokens/KeywordToken";
import {StringToken} from "scripts/expressions/tokenizer/tokens/StringToken";

export const TOKEN = {
    as_keyword: (token: Token): KeywordToken => {
        if (token.type === "keyword") return token
        throw Error(`Cannot cast token to "keyword"`)
    },
    as_string: (token: Token): StringToken => {
        if (token.type === "string") return token
        throw Error(`Cannot cast token to "string"`)
    }
}