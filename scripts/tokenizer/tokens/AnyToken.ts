import {NumberLiteralToken, tokenize_number} from "tokenizer/tokens/NumberToken";
import {KeywordToken, tokenize_keyword} from "tokenizer/tokens/KeywordToken";
import {DiceToken, tokenize_roll, WeaponToken} from "tokenizer/tokens/DiceToken";
import {FunctionToken, tokenize_function} from "tokenizer/tokens/FunctionToken";
import {Scanner} from "tokenizer/scanner";
import {is_non_numeric_character, is_numeric_character} from "tokenizer/regexes";

export const tokenize_any = (scanner: Scanner): Token => {
    const char = scanner.peek()

    if (is_numeric_character(char))
        return tokenize_number(scanner)
    else if (char === "[")
        return tokenize_roll(scanner)
    else if (is_non_numeric_character(char))
        return tokenize_keyword(scanner)
    else if (char === "$")
        return tokenize_function(scanner)
    else
        throw Error(`unexpected character found while tokenizing ${scanner.text}, can't parse "${scanner.peek()}"`)
}

export type Token = NumberLiteralToken | KeywordToken | DiceToken | WeaponToken | FunctionToken
