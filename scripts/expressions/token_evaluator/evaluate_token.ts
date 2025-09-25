import {roll_d} from "randomness/dice";
import type {Token} from "expressions/tokenizer/tokens/AnyToken";
import {is_number, is_number_resolved} from "expressions/token_evaluator/add_numbers";
import type {AstNode, AstNodeNumber, AstNodeNumberResolved, InterpretProps} from "expressions/token_evaluator/types";
import {evaluate_token_keyword} from "expressions/token_evaluator/internals/evaluate_token_keyword";
import {evaluate_token_string} from "expressions/token_evaluator/internals/evaluate_token_string";
import {evaluate_token_number} from "expressions/token_evaluator/internals/evaluate_token_number";
import {evaluate_token_weapon} from "expressions/token_evaluator/internals/evaluate_token_weapon";
import {evaluate_token_dice} from "expressions/token_evaluator/internals/evaluate_token_dice";
import {evaluate_token_function} from "expressions/token_evaluator/internals/evaluate_token_function";

export const resolve_number = (number: AstNodeNumber): AstNodeNumberResolved => {
    if (is_number_resolved(number)) return number
    if (number.params === undefined)
        return roll_d(number.max) //TODO this is to be enhanced when randomness apart from dice is added
    const resolved_parts = number.params.map(part => is_number(part) ? resolve_number(part) : part)
    return {
        type: "number_resolved",
        value: resolved_parts.reduce((result, part) => is_number(part) ? part.value + result : result, 0),
        description: number.description,
        params: resolved_parts
    }
}

/*
    This is called "evaluate" instead on "interpret" to distinguish the expressions that evaluate to a value from the
    interpreting of instructions that affect the game context.
 */
export const evaluate_token = ({token, ...props}: InterpretProps<Token>): AstNode => {
    switch (token.type) {
        case "function":
            return evaluate_token_function({token, ...props})
        case "number":
            return evaluate_token_number({token, ...props})
        case "string":
            return evaluate_token_string({token, ...props})
        case "weapon":
            return evaluate_token_weapon({token, ...props})
        case "dice":
            return evaluate_token_dice({token, ...props})
        case "keyword":
            return evaluate_token_keyword({token, ...props})
    }
}
