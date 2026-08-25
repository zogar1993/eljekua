import type {AstNodeNumber} from "core/expressions/parser/nodes/AstNodeNumber";
import {parse_number} from "core/expressions/parser/nodes/AstNodeNumber";
import type {AstNodeKeyword} from "core/expressions/parser/nodes/AstNodeKeyword";
import {parse_keyword} from "core/expressions/parser/nodes/AstNodeKeyword";
import type {AstNodeDice, AstNodeWeapon} from "core/expressions/parser/nodes/AstNodeRoll";
import {parse_roll} from "core/expressions/parser/nodes/AstNodeRoll";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {parse_function} from "core/expressions/parser/nodes/AstNodeFunction";
import type {Scanner} from "core/expressions/parser/scanner";
import {is_non_numeric_character, is_numeric_character} from "core/expressions/parser/regexes";
import type {AstNodeString} from "core/expressions/parser/nodes/AstNodeString";
import {parse_string} from "core/expressions/parser/nodes/AstNodeString";

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