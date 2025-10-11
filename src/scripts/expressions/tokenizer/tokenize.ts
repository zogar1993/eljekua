import {assert} from "scripts/assert";
import {Scanner} from "scripts/expressions/tokenizer/scanner";
import {Token, tokenize_any} from "scripts/expressions/tokenizer/tokens/AnyToken";

export const tokenize = (value: string | number): Token => {
    const text = `${value}`
    const scanner = new Scanner(text)
    const token = tokenize_any(scanner)
    assert(scanner.is_at_end(), () => `expected end of formula but found more text on ${text}`)
    return token
}
