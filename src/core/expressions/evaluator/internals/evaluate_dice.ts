import type {ExprNumberUnresolved} from "core/expressions/evaluator/types";
import type {AstNodeDice} from "core/expressions/parser/nodes/AstNodeRoll";
import {add_numbers} from "core/expressions/evaluator/number_utils";

export const evaluate_dice = (node: AstNodeDice): ExprNumberUnresolved => {
    const description = `d${node.faces}`
    const die: ExprNumberUnresolved = {type: "number_unresolved", min: 1, max: node.faces, description}
    if (node.amount === 1) return die
    return {...add_numbers(Array.from({length: node.amount}, () => die)), description: `${node.faces}${description}`}
}
