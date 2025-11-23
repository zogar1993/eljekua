import {AstNodeNumber, parse_number} from "scripts/expressions/parser/nodes/AstNodeNumber";
import {AstNodeKeyword, parse_keyword} from "scripts/expressions/parser/nodes/AstNodeKeyword";
import {AstNodeDice, parse_roll, AstNodeWeapon} from "scripts/expressions/parser/nodes/AstNodeRoll";
import {AstNodeFunction, parse_function} from "scripts/expressions/parser/nodes/AstNodeFunction";
import {Scanner} from "scripts/expressions/parser/scanner";
import {is_non_numeric_character, is_numeric_character} from "scripts/expressions/parser/regexes";
import {AstNodeString, parse_string} from "scripts/expressions/parser/nodes/AstNodeString";

export const parse_any = (scanner: Scanner): AstNode => {
    const char = scanner.peek()

    if (is_numeric_character(char))
        return parse_number(scanner)
    else if (char === "{")
        return parse_roll(scanner)
    else if (is_non_numeric_character(char))
        return parse_keyword(scanner)
    else if (char === "$")
        return parse_function(scanner)
    else if (char === `"`)
        return parse_string(scanner)
    else
        throw Error(`unexpected character found while parsing ${scanner.text}, can't parse "${scanner.peek()}"`)
}

export type AstNode = AstNodeNumber | AstNodeKeyword | AstNodeDice | AstNodeWeapon | AstNodeFunction | AstNodeString