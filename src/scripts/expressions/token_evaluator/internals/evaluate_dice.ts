import type {AstNodeNumberUnresolved} from "scripts/expressions/token_evaluator/types";
import type {DiceToken} from "scripts/expressions/tokenizer/tokens/RollToken";
import {number_utils} from "scripts/expressions/token_evaluator/number_utils";

export const evaluate_dice = (token: DiceToken): AstNodeNumberUnresolved => {
    const description = `d${token.faces}`
    const node: AstNodeNumberUnresolved = {type: "number_unresolved", min: 1, max: token.faces, description}
    return token.amount === 1 ?
        node :
        {...number_utils(Array.from({length: token.amount}, () => node)), description: `${token.faces}${description}`}
}
