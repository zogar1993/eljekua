import type {ExprNumberUnresolved} from "scripts/expressions/token_evaluator/types";
import type {DiceToken} from "scripts/expressions/tokenizer/tokens/RollToken";
import {number_utils} from "scripts/expressions/token_evaluator/number_utils";

export const evaluate_dice = (token: DiceToken): ExprNumberUnresolved => {
    const description = `d${token.faces}`
    const die: ExprNumberUnresolved = {type: "number_unresolved", min: 1, max: token.faces, description}
    if (token.amount === 1) return die
    return {...number_utils(Array.from({length: token.amount}, () => die)), description: `${token.faces}${description}`}
}
