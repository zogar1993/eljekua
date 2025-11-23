import type {ExprNumberUnresolved} from "scripts/expressions/evaluator/types";
import type {AstNodeDice} from "scripts/expressions/parser/nodes/AstNodeRoll";
import {number_utils} from "scripts/expressions/evaluator/number_utils";

export const evaluate_dice = (node: AstNodeDice): ExprNumberUnresolved => {
    const description = `d${node.faces}`
    const die: ExprNumberUnresolved = {type: "number_unresolved", min: 1, max: node.faces, description}
    if (node.amount === 1) return die
    return {...number_utils(Array.from({length: node.amount}, () => die)), description: `${node.faces}${description}`}
}
