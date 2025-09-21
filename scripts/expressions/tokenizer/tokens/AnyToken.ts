import {NumberToken, tokenize_number} from "expressions/tokenizer/tokens/NumberToken";
import {KeywordToken, tokenize_keyword} from "expressions/tokenizer/tokens/KeywordToken";
import {DiceToken, tokenize_roll, WeaponToken} from "expressions/tokenizer/tokens/DiceToken";
import {TokenFunction, tokenize_function} from "expressions/tokenizer/tokens/TokenFunction";
import {Scanner} from "expressions/tokenizer/scanner";
import {is_non_numeric_character, is_numeric_character} from "expressions/tokenizer/regexes";
import {StringToken, tokenize_string} from "expressions/tokenizer/tokens/StringToken";

export const tokenize_any = (scanner: Scanner): Token => {
    const char = scanner.peek()

    if (is_numeric_character(char))
        return tokenize_number(scanner)
    else if (char === "{")
        return tokenize_roll(scanner)
    else if (is_non_numeric_character(char))
        return tokenize_keyword(scanner)
    else if (char === "$")
        return tokenize_function(scanner)
    else if (char === `"`)
        return tokenize_string(scanner)
    else
        throw Error(`unexpected character found while tokenizing ${scanner.text}, can't parse "${scanner.peek()}"`)
}

export type Token = NumberToken | KeywordToken | DiceToken | WeaponToken | TokenFunction | StringToken
