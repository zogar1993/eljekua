import {assert} from "assert";
import {Scanner} from "tokenizer/scanner";
import {Token, tokenize_any} from "tokenizer/tokens/AnyToken";

export const tokenize = (text: string): Token => {
    const scanner = new Scanner(text)
    const token = tokenize_any(scanner)
    assert(scanner.is_at_end(), () => `expected end of formula but found more text on ${text}`)
    return token
}

