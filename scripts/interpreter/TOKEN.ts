import {Token} from "tokenizer/tokens/AnyToken";
import {KeywordToken} from "tokenizer/tokens/KeywordToken";
import {StringToken} from "tokenizer/tokens/StringToken";

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