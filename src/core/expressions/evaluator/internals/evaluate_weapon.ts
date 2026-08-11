import type {ExprNumberUnresolved} from "core/expressions/evaluator/types";
import type {AstNodeWeapon} from "core/expressions/parser/nodes/AstNodeRoll";
import {add_numbers} from "core/expressions/evaluator/number_utils";

export const evaluate_weapon = (node: AstNodeWeapon): ExprNumberUnresolved => {
    const die: ExprNumberUnresolved = {type: "number_unresolved", min: 1, max: 4, description: `W`}
    if (node.amount === 1) return die
    return {...add_numbers(Array.from({length: node.amount}, () => die)), description: `${node.amount}W`}
}

